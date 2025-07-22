
import { existsSync } from "node:fs";
import { copyFileSync } from "../copy-file/copyFileSync.ts";
import { pathInfoSync } from "../path-info/pathInfoSync.ts";
import type { FileInfo } from "../path-info/types.ts";



/**
 * Creates a backup of the specified file by copying it to a new uniquely named file
 * in the same directory, using a timestamp and counter to avoid overwriting.
 * 
 * If the file doesn't exist or is a directory, no backup is created.
 * 
 * You can optionally provide a custom backup file-naming function.
 * 
 * @param absoluteFileUri Absolute path to the file to back up.
 * @param getBackupFile - Optional. A callback that, given the file’s `FileInfo`,
 *                        returns an object with:
 *                        - `uri?: string` – full path for the backup file
 *                        - `file?: string` – file name only (for informational use)
 *                        Defaults to a timestamped `*.bak` naming scheme.
 * 
 * @returns The URI of the created backup file, or `undefined` if the original file was missing.
 * 
 * @throws Will throw an error if:
 * - The path points to a directory instead of a file.
 * - All possible backup names are taken (after 10 attempts).
 * - Copying the file fails.
 * 
 * 
 * @example
 * ```ts
 * const uri = backupFileSync('/data/config.json');
 * console.log(uri); 
 * // -> '/data/config_20250722083015432-0.bak' (or next available slot)
 * // the slot (0 here) increments if another backup exists at the same millisecond
 * ```
 * 
 * @example
 * ```ts
 * // Custom naming strategy
 * const uri = backupFileSync('/logs/app.log', ({ name, dirname }) => {
 *   const file = `${name}.backup.bak`;
 *   return { uri: `${dirname}/${file}`, file };
 * });
 * console.log(uri); 
 * // -> '/logs/app.backup.bak'
 * ```
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
        
        file = `${d.name}_${getFormattedDate()}-${c}${d.extension_inc_dot}.bak`;
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

