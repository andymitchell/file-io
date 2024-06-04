
import { fileIoNode } from '../fileIoNode';
import { fileIoSyncNode } from '../fileIoSyncNode';
import { IFileIo, IFileIoSync } from '../types';
import { getInvokedScriptDirectory, getInvokedScriptDirectorySync } from './getInvokedScriptDirectory';



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
export function getPackageDirectorySync(startFromDirectory?: string, fileIo?:IFileIoSync):string {
    return getPackageDirectoryInternalSync(startFromDirectory, fileIo);
}

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

export function getPackageDirectoryForSelfInTesting():string {
    return getPackageDirectoryInternalSync(undefined, undefined, undefined, {testing_skip_package_check: true});
}

type Options = {testing_skip_package_check?: boolean};

async function getPackageDirectoryInternal(startFromDirectory?: string, fileIo?:IFileIo, recursing?:boolean, options?: Options):Promise<string> {
    if( !fileIo ) fileIo = fileIoNode;
    if( !startFromDirectory ) {
        startFromDirectory = await getInvokedScriptDirectory();
    }
    
    let currentDirectory = startFromDirectory;
    let foundPackageJsonUri:string | undefined;
    while(true) {
        const files = await fileIo.list_files(currentDirectory, {file_pattern: /^package\.json$/i});
        foundPackageJsonUri = files[0]?.uri;
        if( foundPackageJsonUri ) break;
        currentDirectory =  await fileIo.directory_name(currentDirectory);
        if( !directoryHasParent(currentDirectory) ) break;
    }

    const packageJson = foundPackageJsonUri? await fileIo.read(foundPackageJsonUri) : undefined;
    const action = processPackage(packageJson, recursing, options);
    if( action==='recurse' ) {
        // Got to go to the next level
        const parentDirectory = await fileIo.directory_name(await fileIo.directory_name(foundPackageJsonUri!));
        return getPackageDirectoryInternal(parentDirectory, fileIo, true);
    } else if( action==='ok' ) {
        return fileIo.directory_name(foundPackageJsonUri!);
    }
    return '';
}

function getPackageDirectoryInternalSync(startFromDirectory?: string, fileIo?:IFileIoSync, recursing?:boolean, options?: Options):string {
    if( !fileIo ) fileIo = fileIoSyncNode;
    if( !startFromDirectory ) {
        startFromDirectory = getInvokedScriptDirectorySync();
    }
    
    let currentDirectory = startFromDirectory;
    let foundPackageJsonUri:string | undefined;
    while(true) {
        const files = fileIo.list_files(currentDirectory, {file_pattern: /^package\.json$/i});
        foundPackageJsonUri = files[0]?.uri;
        if( foundPackageJsonUri ) break;
        currentDirectory =  fileIo.directory_name(currentDirectory);
        if( !directoryHasParent(currentDirectory) ) break;
    }

    const packageJson = foundPackageJsonUri? fileIo.read(foundPackageJsonUri) : undefined;
    const action = processPackage(packageJson, recursing, options);
    if( action==='recurse' ) {
        // Got to go to the next level
        const parentDirectory = fileIo.directory_name(fileIo.directory_name(foundPackageJsonUri!));
        return getPackageDirectoryInternalSync(parentDirectory, fileIo, true);
    } else if( action==='ok' ) {
        return fileIo.directory_name(foundPackageJsonUri!);
    }
    return '';
}

function processPackage(packageJson?:string, recursing?: boolean, options?: Options) {
    if( !packageJson ) return '';

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
        return 'recurse';
    } else {
        return 'ok'
    }

}

function directoryHasParent(directory:string):boolean {
    return !(directory==='/' || directory.length<=2 );
}