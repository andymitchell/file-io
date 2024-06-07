import { stripTrailingSlash } from './stripTrailingSlash';
import { fileURLToPath } from 'url';
import * as path from 'path';

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
export function getCallingScriptDirectorySync(excludeAdditionalFilesInStack?:RegExp) {
    
    
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

    const error = new Error();
    const stack = error.stack || '';

    const stackLines = stack.split('\n');
    
    // Find the line in the stack that does not include this file
    for (const line of stackLines) {
        if (!line.includes(filename) && !/getCallingScriptDirectory\.(j|t)s/.test(line) && (!excludeAdditionalFilesInStack || !excludeAdditionalFilesInStack.test(line))) {
            const match = line.match(/\((.*?):\d+:\d+\)/);
            if (match) {
                const callingFile = match[1];
                if( !callingFile ) throw new Error("Could not find calling file in stack trace");
                return path.dirname(callingFile);
            }
        }
    }

    throw new Error('Could not determine calling script directory');
}

export async function getCallingScriptDirectory(excludeAdditionalFilesInStack?:RegExp) {
    return getCallingScriptDirectorySync(excludeAdditionalFilesInStack);
}