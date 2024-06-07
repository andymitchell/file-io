
import { dLog, dLogWarn } from '@andyrmitchell/utils';
import { fileIoNode } from '../fileIoNode';
import { fileIoSyncNode } from '../fileIoSyncNode';
import { IFileIo, IFileIoSync } from '../types';
import { getInvokedScriptDirectory, getInvokedScriptDirectorySync } from './getInvokedScriptDirectory';

type Options = {testing?:{skip_fileio_package_check?: boolean, verbose?:boolean}};


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
export function getPackageDirectorySync(startFromDirectory?: string, fileIo?:IFileIoSync, options?: Options):string {
    return getPackageDirectoryInternalSync(startFromDirectory, fileIo, undefined, options);
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
export async function getPackageDirectory(startFromDirectory?: string, fileIo?:IFileIo, options?: Options):Promise<string> {
    return getPackageDirectoryInternal(startFromDirectory, fileIo, undefined, options);
}

export function getPackageDirectoryForSelfInTesting():string {
    return getPackageDirectoryInternalSync(undefined, undefined, undefined, {testing:{'skip_fileio_package_check': true}});
}


async function getPackageDirectoryInternal(startFromDirectory?: string, fileIo?:IFileIo, recursing?:boolean, options?: Options):Promise<string> {
    if( !fileIo ) fileIo = fileIoNode;
    if( options?.testing?.verbose ) dLog('getPackageDirectory', `initialise`, {startFromDirectory, getInvokedScriptDirectory: await getInvokedScriptDirectory(), recursing});
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
    if( options?.testing?.verbose ) dLog('getPackageDirectory', `foundPackageJsonUri: ${foundPackageJsonUri}. action: ${action}`);
    if( action==='recurse' ) {
        // Got to go to the next level
        const parentDirectory = await fileIo.directory_name(await fileIo.directory_name(foundPackageJsonUri!));
        return getPackageDirectoryInternal(parentDirectory, fileIo, true, options);
    } else if( action==='ok' ) {
        return await fileIo.directory_name(foundPackageJsonUri!);
    }
    return '';
}

function getPackageDirectoryInternalSync(startFromDirectory?: string, fileIo?:IFileIoSync, recursing?:boolean, options?: Options):string {
    if( !fileIo ) fileIo = fileIoSyncNode;
    if( options?.testing?.verbose ) dLog('getPackageDirectory', `initialise`, {startFromDirectory, getInvokedScriptDirectory: getInvokedScriptDirectorySync(), recursing});
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
    if( options?.testing?.verbose ) dLog('getPackageDirectory', `foundPackageJsonUri: ${foundPackageJsonUri}. action: ${action}`);
    if( action==='recurse' ) {
        // Got to go to the next level
        const parentDirectory = fileIo.directory_name(fileIo.directory_name(foundPackageJsonUri!));
        return getPackageDirectoryInternalSync(parentDirectory, fileIo, true, options);
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

    if( foundThisPackage && !options?.testing?.skip_fileio_package_check ) {
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

