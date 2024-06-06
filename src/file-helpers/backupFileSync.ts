import { stripTrailingSlash } from "../directory-helpers";
import { fileIoSyncNode } from "../fileIoSyncNode";


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

    const details = getFileDetails(absoluteFileUri);
    
    const backupDetails = getBackupFile(details);

    fileIoSyncNode.copy_file(absoluteFileUri, backupDetails.uri);
    return backupDetails.uri;

}

type GetBackupName = (details:FileDetails) => {uri:string, file:string};
type FileDetails = {fileName:string, extension:string, file: string, directory:string, uri:string};

function getFileDetails(uri:string):FileDetails {
    const directory = stripTrailingSlash(fileIoSyncNode.directory_name(uri));
    const file = uri.replace(directory, '').replace(/^\//, '');

    const parts = file.split('.');
    const extension = parts[parts.length-1] ?? '';
    if( extension ) parts.pop();
    const fileName = parts.join('.');

    return {directory, file, fileName, extension, uri};
}

const getBackupFileDefault:GetBackupName = (d:FileDetails) => {
    let file: string | undefined;
    let uri: string | undefined;
    let c = 0;
    while(c++<10) {
        const backupStamp = `backup_${Date.now()}${c}`;
        file = `${d.fileName}.${backupStamp}` + (d.extension? `.${d.extension}` : '');
        uri = `${d.directory}/${file}`;
        if( !fileIoSyncNode.has_file(uri) ) {
            break;
        }
    }

    if( !uri || !file ) throw new Error('Backup could not generate uri or file');

    return {uri, file}
}


