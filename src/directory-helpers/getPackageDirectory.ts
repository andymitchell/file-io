
import { fileIoNode } from '../fileIoNode';
import { IFileIo } from '../types';
import { getInvokedScriptDirectory } from './getInvokedScriptDirectory';



/**
 * Find the nearest ancestor with package.json. Returns an absolute path. 
 * 
 * The default startFromDirectory:
 *  - If your code is packaged and deployed in a consumer's node_modules: your package's root (i.e. node_modules/your-package)
 *  - If you're running your code directly (including a test environment), it'll be the root
 * 
 * @param startFromDirectory 
 * @param fileIo 
 * @returns 
 */
export async function getPackageDirectory(startFromDirectory?: string, fileIo?:IFileIo):Promise<string> {
    return getPackageDirectoryInternal(startFromDirectory, fileIo);
}

export async function getPackageDirectoryInternal(startFromDirectory?: string, fileIo?:IFileIo, recursing?:boolean, options?: {testing_skip_package_check?: boolean}):Promise<string> {
    if( !fileIo ) fileIo = fileIoNode;
    if( !startFromDirectory ) {
        startFromDirectory = await getInvokedScriptDirectory();
    }
    
    let currentDirectory = startFromDirectory;
    let foundPackageJsonUri:string | undefined;
    while(true) {
        const files = await fileIo.list_files(currentDirectory, {file_pattern: /^package\.json$/i});
        const file = files[0];
        if( file ) {
            foundPackageJsonUri = file.uri;
            break;
        }
        currentDirectory =  fileIo.directory_name(currentDirectory);
        if( currentDirectory==='/' || currentDirectory.length<=2 ) {
            break;
        }
    }

    // Check against returning this package - we want the package.json below our packaged self
    if( foundPackageJsonUri ) {
        const packageJson = await fileIo.read(foundPackageJsonUri);
        let foundThisPackage = false;
        try {
            const pkg = JSON.parse(packageJson!);
            foundThisPackage = pkg.is_andyrmitchell_file_io_package;
                

        } catch(e) {
            debugger;
        }

        if( foundThisPackage && !options?.testing_skip_package_check ) {
            if( recursing ) {
                throw new Error("Should not recurse twice");
            }
            // Got to go to the next level
            const parentDirectory = fileIo.directory_name(fileIo.directory_name(foundPackageJsonUri));
            return getPackageDirectoryInternal(parentDirectory, fileIo, true);
        } else {
            return fileIo.directory_name(foundPackageJsonUri);
        }
    }
    return '';

    
    

}

