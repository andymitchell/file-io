
import { fileIoSyncNode } from "../fileIoSyncNode.js";
import type { FileInfo } from "../types.js";


/**
 * Create a backup of the given file
 * @param absoluteFileUri The file to back up
 * @param getBackupFile Optional custom way to generate the backup text in the new file name
 * @returns The backup file uri 
 * @example
 * Given /a/b/c.txt it'll generate /a/b/c.backup_20240101010.txt (or a higher number until it finds a unique name)
 */
export function backupFileSync(absoluteFileUri:string, getBackupFile?: GetBackupName):string | undefined {
    if( !fileIoSyncNode.has_file(absoluteFileUri) ) return undefined;

    if( !getBackupFile ) {
        getBackupFile = getBackupFileDefault;
    }

    
    
    const backupDetails = getBackupFile(fileIoSyncNode.file_info(absoluteFileUri));

    fileIoSyncNode.copy_file(absoluteFileUri, backupDetails.uri);
    return backupDetails.uri;

}

type GetBackupName = (details:FileInfo) => {uri:string, file:string};

const getBackupFileDefault:GetBackupName = (d:FileInfo) => {
    let file: string | undefined;
    let uri: string | undefined;
    let c = 0;
    while(c<10) {
        
        file = `${d.file}_${getFormattedDate()}-${c}.bak`;
        uri = `${d.directory}/${file}`;
        if( !fileIoSyncNode.has_file(uri) ) {
            break;
        }
        c++;
    }

    if( !uri || !file ) throw new Error('Backup could not generate uri or file');

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

