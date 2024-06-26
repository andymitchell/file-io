import { stripTrailingSlash } from './stripTrailingSlash';
import { fileURLToPath } from 'url';
import {dirname} from 'path';

/**
 * E.g. if invoked as "node ./dist/main.js", this will return "<path-to>/dist"
 * @returns 
 */
export function getInvokedScriptDirectorySync() {
    
    if (typeof __dirname !== 'undefined') {
        // CommonJS environment
        return stripTrailingSlash(__dirname);
    } else {
        
    
        // ES Module environment
        /*
        // @ts-ignore
        const { fileURLToPath } = await import('url');
        // @ts-ignore
        const { dirname } = await import('path');
        */

        // @ts-ignore handled by the test for __dirname
        const esmUrl = import.meta.url;
        
        const __filename = fileURLToPath(esmUrl);
        return stripTrailingSlash(dirname(__filename));
    
    }
}

export async function getInvokedScriptDirectory() {
    return getInvokedScriptDirectorySync();
}