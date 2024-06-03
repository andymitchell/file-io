
import { fileIoNode } from '../fileIoNode';
import { IFileIo } from '../types';
import { getInvokedScriptDirectory } from './getInvokedScriptDirectory';



/**
 * Find the nearest ancestor with a package.json, including when it's consumed within node modules. 
 * Use it to find relative paths from the root that are consistent in deployment.
 * 
 * E.g. if in ./node_modules/pg-queue, it'll return "<path to>/node_modules/pg-queue"
 * @returns 
 */
export async function getPackageDirectory(fileIo?:IFileIo):Promise<string> {
    if( !fileIo ) fileIo = fileIoNode;

    const startFrom = await getInvokedScriptDirectory();

    let currentDirectory = startFrom;
    while(true) {
        const files = await fileIo.list_files(currentDirectory, {file_pattern: /^package\.json$/i});
        const file = files[0];
        if( file ) {
            return file.path;
        }
        currentDirectory =  fileIo.directory_name(currentDirectory);
        if( currentDirectory==='/' || currentDirectory.length<=2 ) {
            return '';
        }
    }
    

}

