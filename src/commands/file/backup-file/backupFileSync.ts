
import { existsSync } from "node:fs";
import { copyFileSync } from "../copy-file/copyFileSync.ts";
import { pathInfoSync } from "../path-info/pathInfoSync.ts";
import type { FileInfo } from "../path-info/types.ts";



/**
 * Create a backup of the given file
 * @param absoluteFileUri The file to back up
 * @param getBackupFile Optional custom way to generate the backup text in the new file name
 * @returns The backup file uri 
 * @example
 * Given /a/b/c.txt it'll generate /a/b/c.backup_20240101010.txt (or a higher number until it finds a unique name)
 */
export function backupFileSync(absoluteFileUri:string, getBackupFile: GetBackupName = getBackupFileDefault):string | undefined {
    if( !existsSync(absoluteFileUri) ) return undefined;


    const filePath = pathInfoSync(absoluteFileUri);
    if( filePath.type==='dir' ) throw new Error("Only supports files");

    const backupDetails = getBackupFile(filePath);

    
    if( !backupDetails.uri || existsSync(backupDetails.uri) ) {
        throw new Error("Bad backup uri: All back up names are taken. Could not complete the operation.");
    } 

    const result = copyFileSync(absoluteFileUri, backupDetails.uri);
    if( result.error ) throw result.error;
    return backupDetails.uri;

}

type GetBackupName = (details:FileInfo) => {uri?:string, file?:string};

const getBackupFileDefault:GetBackupName = (d:FileInfo) => {
    let file: string | undefined;
    let uri: string | undefined;
    let c = 0;
    while(c<10) {
        
        file = `${d.name}_${getFormattedDate()}-${c}.bak`;
        uri = `${d.dirname}/${file}`;
        if( !existsSync(uri) ) {
            break;
        }
        c++;
    }

    return {uri, file}
}

function getFormattedDate(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}

