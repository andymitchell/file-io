

import { fileIoNode } from '../fileIoNode';
import { fileIoSyncNode } from '../fileIoSyncNode';
import { IFileIo, IFileIoSync } from '../types';
import { getInvokedScriptDirectory, getInvokedScriptDirectorySync } from './getInvokedScriptDirectory';
import { getCallingScriptDirectory, getCallingScriptDirectorySync } from './getCallingScriptDirectory';
import * as path from 'path';
import { readJsonFromFile, readJsonFromFileSync } from '../file-helpers';
import { dLog } from '@andyrmitchell/utils';


type Package = {package_uri:string, package_directory:string, package_object:Record<string, any>, package_object_error?: string};
type Target = {target: 'caller'} | {target: 'root', strategy?: 'caller-or-caller-consumer' | 'rootiest'} | {target: 'closest-directory', dir:string} | {target:'fileio'};

/**
 * Find the directory with a package.json, depending on a target.
 * 
 * Targets
 * - 'caller' [default]: The package.json dir of the project of the calling environment.
 * - 'root': If called from a project, return that project's package.json dir. Or if deployed in node_modules, return the consuming project's package.json dir.
 * - 'closest-directory': Given a directory, it goes up the tree until it finds package.json. 
 * - 'fileio': This package's package.json. Unlikely to be used, but useful in testing. 
 * 
 * @param target
 * @param fileIo 
 * @param verbose 
 * @returns 
 */
export function getPackageDirectorySync(target?:Target, fileIo?:IFileIoSync, verbose?:boolean):string {
    if( !fileIo ) fileIo = fileIoSyncNode;
    target = targetDefaults(target);
    if( verbose ) dLog('getPackageDirectory', 'target', {target});
    const startDirectory = pickStartingDirectorySync(target, verbose);
    const packages = listPackagesUpwardsSync(fileIo, startDirectory, verbose);

    return pickPackageDirectory(packages, target, verbose);
}

/**
 * Find the directory with a package.json, depending on a target.
 * 
 * Targets
 * - 'caller' [default]: The package.json dir of the project of the calling environment.
 * - 'root': If called from a project, return that project's package.json dir. Or if deployed in node_modules, return the consuming project's package.json dir.
 * - 'closest-directory': Given a directory, it goes up the tree until it finds package.json. 
 * - 'fileio': This package's package.json. Unlikely to be used, but useful in testing. 
 * 
 * @param target 
 * @param fileIo 
 * @param verbose 
 * @returns 
 */
export async function getPackageDirectory(target?:Target, fileIo?:IFileIo, verbose?:boolean):Promise<string> {
    if( !fileIo ) fileIo = fileIoNode;
    target = targetDefaults(target);
    const startDirectory = await pickStartingDirectoryAsync(target, verbose);
    const packages = await listPackagesUpwardsAsync(fileIo, startDirectory, verbose);

    return pickPackageDirectory(packages, target, verbose);
}


function pickStartingDirectorySync(target:Target, verbose?: boolean):string {
    if( target.target==='fileio' ) {
        return getInvokedScriptDirectorySync();
    } else if( target.target==='closest-directory' ) {
        return target.dir;
    } else {
        const callingDirectory = getCallingScriptDirectorySync(getPackageDirectorySync.name, verbose);
        if( verbose ) dLog('getPackageDirectory:pickStartingDirectorySync', 'callingDirectory: '+callingDirectory);
        return callingDirectory
    }
}

function listPackagesUpwardsSync(fileIo:IFileIoSync, startFromDirectory:string, verbose?: boolean):Package[] {
    let packageUris:string[] = [];
    while(true) {
        if( verbose ) dLog('getPackageDirectory:listPackagesUpwardsSync', 'loop looking for package files', {startFromDirectory, packageUris: [...packageUris]});
        packageUris = [...packageUris, ...fileIo.list_files(startFromDirectory, {file_pattern: /^package\.json$/i}).map(x => x.uri)];
        startFromDirectory = fileIo.directory_name(startFromDirectory);
        if( !directoryHasParent(startFromDirectory) ) break;
    }
    if( verbose ) dLog('getPackageDirectory:listPackagesUpwardsSync', 'found packages', {packageUris});
    return packageUris.map(package_uri => {
        const result = readJsonFromFileSync(package_uri, {});
        const package_object = result.object;
        const package_directory = fileIo.directory_name(package_uri);
        return {package_uri, package_object, package_directory, package_object_error: result.error?.message};
    })
}

async function pickStartingDirectoryAsync(target:Target, verbose?: boolean):Promise<string> {
    if( target.target==='fileio' ) {
        return await getInvokedScriptDirectory();
    } else if( target.target==='closest-directory' ) {
        return target.dir;
    } else {
        return await getCallingScriptDirectory(getPackageDirectory.name, verbose);
    }
}

async function listPackagesUpwardsAsync(fileIo:IFileIo, startFromDirectory:string, verbose?: boolean):Promise<Package[]> {
    let packageUris:string[] = [];
    while(true) {
        packageUris = [...packageUris, ...(await fileIo.list_files(startFromDirectory, {file_pattern: /^package\.json$/i})).map(x => x.uri)];
        startFromDirectory = await fileIo.directory_name(startFromDirectory);
        if( !directoryHasParent(startFromDirectory) ) break;
    }
    return Promise.all(packageUris.map(async package_uri => {
        const result = await readJsonFromFile(package_uri, {});
        const package_object = result.object;
        const package_directory = await fileIo.directory_name(package_uri);
        return {package_uri, package_object, package_directory, package_object_error: result.error?.message};
    }))
}

function targetDefaults(target?:Target):Target {
    if( !target ) target = {target: 'caller'};
    if( target.target==='root' && !target.strategy ) target.strategy = 'caller-or-caller-consumer';
    return target;
}
function pickPackageDirectory(packages:Package[], target:Target, verbose?: boolean):string {

    let directory:string | undefined;
    if( target.target==='fileio' ) {
        // Take the first package, as they began at fileioDirectory
        directory = packages[0]?.package_directory;
    } else if( target.target==='closest-directory' ) {
        // Take the first package, as they began at target.dir
        directory = packages[0]?.package_directory;
    } else {
        // Package 0 is the caller's package.
        if( target.target==='root' ) {
            if( target.strategy==='caller-or-caller-consumer' ) {
                // The risk is that if, for some reason, you have a package.json somewhere up the file system, it would naively consider that the root.
                // But, for any project, node_modules is always flat, so the deepest a calling module will be is x/node_modules/y.
                // So if y is saying give me the root, you can trust that the root will be within 1 directory hop. 
                if( packages.length<=1 ) {
                    if( verbose ) dLog('getPackageDirectory:pickPackageDirectory', 'root is package[0]', {target, packages});
                    directory = packages[0]?.package_directory;
                } else {
                    const packageName = packages[0]?.package_object.name;
                    const partsInPackageName = packageName && typeof packageName==='string'? packageName.split('/').length : 2; // Default to 2, as the most generous setting if it fails (allowing @auth/subpackage)
                    const difference = path.relative(packages[1]!.package_directory, packages[0]!.package_directory);
                    const comparison = {differenceParts: difference.split('/').length, allowedParts: (partsInPackageName+1)}
                    const isClose = comparison.differenceParts<=comparison.allowedParts;
                    if( verbose ) dLog('getPackageDirectory:pickPackageDirectory', 'package difference', {target, packages, packageName, partsInPackageName,comparison, difference, isClose});
                    if( isClose ) {
                        if( verbose ) dLog('getPackageDirectory:pickPackageDirectory', 'root is package[1]', {target, packages});
                        directory = packages[1]!.package_directory;
                    } else {
                        // The directory is too far away, don't trust it
                        throw new Error("Cannot trust the found package root - it was too far from the caller.");
                        //directory = packages[0]?.package_directory;
                    }
                }
            } else {
                // Get the last/most-up-the-tree
                directory = packages[packages.length-1]?.package_directory;
            }
        } else if( target.target==='caller' ) {
            directory = packages[0]?.package_directory;
        }
    }
    if( !directory ) {
        throw new Error("Could not pick package directory");
    }
    return directory;


}

export function getPackageDirectoryForSelfInTesting():string {
    return getPackageDirectorySync({target:'fileio'});
}



function directoryHasParent(directory:string):boolean {
    return !(directory==='/' || directory.length<=2 );
}

