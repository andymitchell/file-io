import { stripTrailingSlash } from './stripTrailingSlash';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { dLog } from '@andyrmitchell/utils';

/**
 * Returns the script directory of whoever calls this function. 
 * 
 * E.g. if invoked as "node ./dist/main.js", this will return "<path-to>/dist"
 * @returns 
 * @example
 * // File is x/y/test.ts
 * import {getCallingScriptDirectorySync} from '@andyrmitchell/file-io';
 * console.log(getCallingScriptDirectorySync()) // x/y
 * 
 */
export function getCallingScriptDirectorySync(excludeAdditionalFilesInStack?:RegExp, verbose?: boolean) {
    
    
    let filename:string;
    if (typeof __dirname !== 'undefined') {
        // CommonJS environment
        //dirname = stripTrailingSlash(__dirname);
        filename = __filename;
    } else {
        // ES Module environment
        
        // @ts-ignore handled by the test for __dirname
        const esmUrl = import.meta.url;
        
        filename = fileURLToPath(esmUrl);
        //dirname = stripTrailingSlash(path.dirname(__filename));
    
    }


    if( verbose ) dLog('getCallingScriptDirectory', 'start', {filename, excludeAdditionalFilesInStack});

    const error = new Error();
    const stack = error.stack || '';

    const stackLines = stack.split('\n');

    if( verbose ) dLog('getCallingScriptDirectory', 'stack lines', stackLines);
    
    // Find the line in the stack that does not include this file
    for (const line of stackLines) {
        if (!line.includes(filename) && !/getCallingScriptDirectory\.(j|t)s/.test(line) && (!excludeAdditionalFilesInStack || !excludeAdditionalFilesInStack.test(line))) {
            const match = line.match(/\((.*?):\d+:\d+\)/);
            if (match) {
                const callingFile = match[1];
                if( !callingFile ) throw new Error("Could not find calling file in stack trace");
                const callingFileFull = stripFileUriPrefix(path.dirname(callingFile));
                if( verbose ) dLog('getCallingScriptDirectory', 'found callingFile: ', {callingFile, callingFileFull});
                return path.dirname(callingFile).replace(/^file\:\/\/\//, '');
            }
        }
    }

    throw new Error('Could not determine calling script directory');
}

function stripFileUriPrefix(path:string):string {
    return path.replace(/^file:\/+/, '');
}

export async function getCallingScriptDirectory(excludeAdditionalFilesInStack?:RegExp, verbose?:boolean) {
    return getCallingScriptDirectorySync(excludeAdditionalFilesInStack, verbose);
}