



import { cwd } from 'process';
import { thisDir } from '../this-dir/thisDir.ts';
import { findUpSync } from 'find-up';
import { absolute } from '../absolute/absolute.ts';
import { convertUnknownToError } from '../../../utils/convertUnknownToError.ts';


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

type StartFrom = {
    type: 'cwd'
} | {
    type: 'container',
    /**
     * The `import.meta.url` from the calling file, that you want to find the package.json for 
     */
    esmFileUrl: string
}

/**
 * Locate the nearest package.json from a specified starting point.
 * 
 * This is used to find the package.json in the root of a Node project or the directory containing a module 
 * (e.g. if the code is running as a dependency in node_modules, it can be made to find its own package.json).
 * 
 * @param startFrom Specify the resolution context. Defaults to 'cwd'.
 * - `{type: 'cwd'}`: Start from the current working directory. Use this when you want to find the consuming project's `package.json`.
 * - `{type: 'container', esmFileUrl: string}`: Start from the directory of the calling file. Use this to find the `package.json` the package currently calling this function. `esmFileUrl` should be the caller's `import.meta.url`
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
 * const result = getPackageDirectorySync('container');
 * if (result.success) {
 *   console.log(result.packageJsonPath); // e.g., '/Users/me/my-project/node_modules/my-lib/package.json'
 * }
 *
 * @example
 * // Throw if package.json is not found
 * const path = getPackageDirectorySync('cwd', true).packageJsonPath;
 */
export function getPackageDirectorySync(startFrom?: StartFrom, throwError?: boolean):Response {
    const response = _getPackageDirectorySync(startFrom);

    if( response.success===false && throwError ) {
        throw response.error
    }

    return response;

}


function _getPackageDirectorySync(startFrom?:StartFrom):Response {

    try {
        if( !startFrom ) startFrom = {type: 'cwd'};

        let startDirectory:string;
        if( startFrom.type==='cwd' ) {
            startDirectory = cwd();
        } else {
            startDirectory = thisDir(startFrom.esmFileUrl); // equivalent to `dirname(fileURLToPath(startFrom.esmFileUrl))`
        }

        const result = findUpSync('package.json', {cwd: startDirectory})

        if( !result ) {
            const errorTip = startFrom.type==='cwd'? "Are you running this in the terminal from the same (or deeper) dir as your package.json?" : "Are you calling this from a script that is a node project?";
            return {success: false, error: new Error("Could not find package.json. "+errorTip)};
        }
        
        return {success:true, packageJsonPath: absolute(result)};
    } catch(e) {
        const error = convertUnknownToError(e);

        return {success: false, error};
    }
}

