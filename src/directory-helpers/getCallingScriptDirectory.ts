
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
export function getCallingScriptDirectorySync(excludeAdditionalFunctionName?:string, verbose?: boolean) {
    
    
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


    const thisFunctionName = getCallingScriptDirectorySync.name;
    if( verbose ) dLog('getCallingScriptDirectory', 'start', {filename, thisFunctionName, excludeAdditionalFunctionName});

    const error = new Error();
    const stack = error.stack || '';

    const stackLines = stack.split('\n');

    if( verbose ) dLog('getCallingScriptDirectory', 'stack lines', stackLines);

    // Find the line in the stack that does not include this file
    let foundAdditionalFunctionName = excludeAdditionalFunctionName? false : true;
    for (const line of stackLines) {
        if (!line.includes(functionSignatureInStackTrace(thisFunctionName)) ) {
            let match = line.match(/\((.*?):\d+:\d+\)/);
            if( !match ) match = line.match(/(.*?):\d+:\d+/);
            if (match && foundAdditionalFunctionName ) {
                let callingFile = match[1];
                if( !callingFile ) throw new Error("Could not find calling file in stack trace");
                callingFile = callingFile.replace(/^\s+at\s+/, '');
                const callingDirectory = stripFileUriPrefix(path.dirname(callingFile))
                if( verbose ) dLog('getCallingScriptDirectory', 'found callingFile: ', {callingFile, callingDirectory});
                return callingDirectory;
            }

            if( !foundAdditionalFunctionName && excludeAdditionalFunctionName && line.includes(functionSignatureInStackTrace(excludeAdditionalFunctionName)) ) foundAdditionalFunctionName = true;
        }
    }

    throw new Error('Could not determine calling script directory');
}

function functionSignatureInStackTrace(functionName:string):string {
    return ` ${functionName} (`
}

function stripFileUriPrefix(path:string):string {
    return path.replace(/^file:\/\//, '');
}

export async function getCallingScriptDirectory(excludeAdditionalFunctionName?:string, verbose?:boolean) {
    // TODO This doesn't work when called from external package; because it returns this location (the caller of getCallingScriptDirectorySync)
    return getCallingScriptDirectorySync(excludeAdditionalFunctionName, verbose);
}