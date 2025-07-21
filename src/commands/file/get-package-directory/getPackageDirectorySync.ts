



import { cwd } from 'process';
import { thisDir } from '../this-dir/thisDir.ts';
import { findUpSync } from 'find-up';


/**
 * Find the directory with a package.json, depending on a target.
 * 
 * Targets
 * - `cwd`: The current working directory. Use it to get the consuming project's package.json 
 * - 'container': The closest to this file. Use it to get this module's package.json (e.g. in node_modules).
 * 
 * @param target
 * @returns 
 */
export function getPackageDirectorySync(target:'cwd' | 'container' = 'cwd'):string {

    const dirname = thisDir(import.meta.url)

    const startDirectory = target==='cwd'? cwd() : dirname;

    const result = findUpSync('package.json', {cwd: startDirectory})

    if( !result ) {
        const errorTip = target==='cwd'? "Are you running this in the terminal from the same (or deeper) dir as your package.json?" : "Are you calling this from a script that is a node project?";
        throw new Error("Could not find package.json. "+errorTip);
    }
    
    return result;
}

