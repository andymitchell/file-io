import { dirname, extname, relative as nodeRelative, sep } from "node:path";
import { stripTrailingSep } from "../strip-trailing-sep/stripTrailingSep.ts";
import { existsSync, statSync } from "node:fs";

/**
 * Returns a relative path from a to b.
 * 
 * It always removes any trailing slash from the returned path. 
 * 
 * @param fromAbsolutePathDirectoryOrFile Can be a directory or file. 
 * @param toAbsolutePathDirectoryOrFile Can be a directory or file. 
 * @param fromIsDir Override the inference of whether fromAbsolutePathDirectoryOrFile is a directory or file (for accurate relative resolution). Only needed very rarely (e.g. for a non-existent file with no extension... i.e. no way to decide).
 * @returns 
 * 
 * 
 * @example
 * const result = relative('usr/path/', 'usr/');
 * result === '..'
 * 
 * @example
 * const result = relative('usr/path/', 'usr/file.txt');
 * result === '../file.txt'
 * 
 * @example
 * const result = relative('usr/path/file2.txt', 'usr/file.txt');
 * result === '../file.txt'
 * 
 * @example
 * const result = relative('usr/path/file2.txt', 'usr/');
 * result === '..'
 * 
 */
export function relative(fromAbsolutePathDirectoryOrFile: string, toAbsolutePathDirectoryOrFile: string, fromIsDir?:boolean) {

    
    let isDirectory = false;
    if( typeof fromIsDir==='boolean' ) {
        isDirectory = fromIsDir;
    } else {
        const maybeIsDirectory = inferIsDirectory(fromAbsolutePathDirectoryOrFile);
        if( maybeIsDirectory===undefined ) {
            throw new Error('Could not detect if the `from` path is a directory or file. Please explicitly state with `fromIsDir`.')
        } else {
            isDirectory = maybeIsDirectory;
        }
    }

    const fromDir = isDirectory? fromAbsolutePathDirectoryOrFile : dirname(fromAbsolutePathDirectoryOrFile);

    const relPath = nodeRelative(fromDir, toAbsolutePathDirectoryOrFile);
    return stripTrailingSep(`${relPath.indexOf('../') !== 0 ? './' : ''}${relPath}`);
}

export function inferIsDirectory(absolutePath:string):boolean | undefined {
    let isDirectory:boolean | undefined;    
    if( existsSync(absolutePath) ) {
        isDirectory = statSync(absolutePath).isDirectory();
    } else {
        // If it has a trailing slash, it's assumed to be a directory
        if( absolutePath.endsWith(sep) ) {
            isDirectory = true;
        } else if( extname(absolutePath)!=='' ) {
            isDirectory = false
        }
    }
    return isDirectory;
}