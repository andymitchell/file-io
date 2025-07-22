



import { cwd } from 'process';
import { thisDir } from '../this-dir/thisDir.ts';
import { findUpSync } from 'find-up';
import { absolute } from '../absolute/absolute.ts';
import { convertUnknownToError } from '../../../utils/convertUnknownToError.ts';
import { existsSync } from 'fs';


type Response = {
    success: true, 
    /**
     * The absolute path to the package.json file
     */
    packageJsonPath: string,

    error?: undefined
} | {
    success: false, 
    packageJsonPath?:undefined, 
    error: Error
}

type InOrUpFrom = {
    type: 'cwd'
} | {
    type: 'esm-url',
    /**
     * The `import.meta.url` from the calling file, that you want to find the package.json for 
     */
    esmUrl: string

} | {
    type: 'path',

    /**
     * An absolute or relative path to search in/up from, until it finds the closest package.json 
     */
    path: string
}

/**
 * Locate the nearest package.json from a specified starting point.
 * 
 * This is used to find the package.json in the root of a Node project or the directory containing a module 
 * (e.g. if the code is running as a dependency in node_modules, it can be made to find its own package.json).
 * 
 * @param inOrUpFrom Specify the start point to look for package.json - either in the specified directory or closest up from it. Defaults to `{type:'cwd'}`
 * - `{type: 'cwd'}`: Start from the current working directory. Use this when you want to find the consuming project's `package.json`.
 * - `{type: 'esm-url', esmUrl: string}`: Start from the directory of the calling file. Use this to find the `package.json` the package currently calling this function. `esmUrl` should be the caller's `import.meta.url`
 * - `{type: 'path', path: string}`: Start from an ad hoc directory. 
 *
 * @param throwError If `true`, the function throws an error when no `package.json` is found. Default is `false`.
 *
 * @returns A `Response` object:
 * - `{ success: true, packageJsonPath }` on success. packageJsonPath is an absolute path.
 * - `{ success: false, error }` on failure (unless `throwError` is true, in which case it throws).
 *
 * @example
 * // Find the consuming project's package.json
 * const result = getPackageDirectorySync({type: 'cwd'});
 * if (result.success) {
 *   console.log(result.packageJsonPath); // e.g., '/Users/me/my-project/package.json'
 * }
 *
 * @example
 * // Find the current module's package.json (useful in node_modules)
 * const result = getPackageDirectorySync({type: 'esm-url', esmUrl: import.meta.url});
 * if (result.success) {
 *   console.log(result.packageJsonPath); // e.g., '/Users/me/my-project/node_modules/my-lib/package.json'
 * }
 * 
 * @example
 * // Find the package.json closest to a specified directory
 * const result = getPackageDirectorySync({type: 'path', path: './path/to/'});
 * if (result.success) {
 *   console.log(result.packageJsonPath); // e.g., '/Users/me/path/package.json'
 * }
 * 
 * @example
 * // Find the package.json closest to a specified file
 * const result = getPackageDirectorySync({type: 'path', path: './path/to/something.txt'});
 * if (result.success) {
 *   console.log(result.packageJsonPath); // e.g., '/Users/me/path/package.json'
 * }
 *
 * @example
 * // Throw if package.json is not found
 * const path = getPackageDirectorySync('cwd', true).packageJsonPath;
 */
export function getPackageDirectorySync(inOrUpFrom?: InOrUpFrom, throwError?: boolean):Response {
    const response = _getPackageDirectorySync(inOrUpFrom);

    if( response.success===false && throwError ) {
        throw response.error
    }

    return response;

}


function _getPackageDirectorySync(inOrUpFrom?:InOrUpFrom):Response {

    try {
        if( !inOrUpFrom ) inOrUpFrom = {type: 'cwd'};

        let startDirectory:string;
        if( inOrUpFrom.type==='cwd' ) {
            startDirectory = cwd();
        } else if( inOrUpFrom.type==='esm-url' ) {
            startDirectory = thisDir(inOrUpFrom.esmUrl); // equivalent to `dirname(fileURLToPath(inOrUpFrom.esmUrl))`
        } else {
            startDirectory = absolute(inOrUpFrom.path);
        }

        if( !existsSync(startDirectory) ) {
            return {success: false, error: new Error(`Could not verify startDirectory ${startDirectory} exists`)};
        }

        const result = findUpSync('package.json', {cwd: startDirectory})

        if( !result ) {
            const errorTip = inOrUpFrom.type==='cwd'? "Are you running this in the terminal from the same (or deeper) dir as your package.json?" : "Are you calling this from a script that is a node project?";
            return {success: false, error: new Error("Could not find package.json. "+errorTip)};
        }
        
        return {success:true, packageJsonPath: absolute(result)};
    } catch(e) {
        const error = convertUnknownToError(e);

        return {success: false, error};
    }
}

