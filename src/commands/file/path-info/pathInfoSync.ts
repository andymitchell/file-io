import {dirname as nodeDirname, basename as nodeBasename, extname as nodeExtname} from 'path';
import {existsSync, statSync} from "node:fs";
import { stripTrailingSep } from "../strip-trailing-sep/stripTrailingSep.ts";
import type { PathInfo } from "./types.ts";
import { absolute } from "../absolute/absolute.ts";

/**
 * Retrieve detailed information about a file or directory at the given absolute 
 *
 * @param {string} absolutePathToFile - An absolute path to a file or directory.
 * @returns {PathInfo} Information about the path:
 *  - If the path is a directory:
 *    - `type`: `'dir'`
 *    - `dirname`: the directory path, without a trailing slash
 *    - `uri`: same as `dirname`
 *  - If the path is a file:
 *    - `type`: `'file'`
 *    - `basename`: the filename including extension (e.g. `foo.txt`)
 *    - `name`: the filename without its extension (e.g. `foo`)
 *    - `extension`: the file extension without the leading dot (e.g. `txt`)
 *    - `extension_inc_dot`: the file extension including the leading dot (e.g. `.txt`)
 *    - `dirname`: the directory path containing the file, without a trailing slash
 *    - `uri`: a URI‑style string combining `dirname` and `basename`
 *
 * @throws {Error} If the path does not exist or cannot be accessed.
 *
 * @example
 * ```ts
 * // Directory example
 * import { pathInfoSync } from './pathInfoSync';
 *
 * const dirInfo = pathInfoSync('/usr/local/bin/');
 * console.log(dirInfo);
 * // {
 * //   type: 'dir',
 * //   dirname: '/usr/local/bin',
 * //   uri: '/usr/local/bin'
 * // }
 * ```
 *
 * @example
 * ```ts
 * // File example
 * import { pathInfoSync } from './pathInfoSync';
 *
 * const fileInfo = pathInfoSync('/usr/local/bin/node.exe');
 * console.log(fileInfo);
 * // {
 * //   type: 'file',
 * //   basename: 'node.exe',
 * //   name: 'node',
 * //   extension: 'exe',
 * //   extension_inc_dot: '.exe',
 * //   dirname: '/usr/local/bin',
 * //   uri: '/usr/local/bin/node.exe'
 * // }
 * ```
 */
export function pathInfoSync(pathToFile: string, throwError:true): PathInfo;
export function pathInfoSync(pathToFile: string, throwError?:boolean): PathInfo | undefined;
export function pathInfoSync(pathToFile: string, throwError?:boolean): PathInfo | undefined {
    try {
        const absolutePathToFile = absolute(pathToFile);

        if( !existsSync(absolutePathToFile) ) {
            throw new Error(`Could not find ${absolutePathToFile}`);
        }

        const stats = statSync(absolutePathToFile);

        if (stats.isDirectory()) {
            const dirname = stripTrailingSep(absolutePathToFile);
            return {
                type: 'dir',
                dirname,
                uri: dirname
            };
        }

        let dirname = stripTrailingSep(nodeDirname(absolutePathToFile));
        if (dirname === '.') dirname = '';
        const basename = nodeBasename(absolutePathToFile);
        const name = nodeBasename(absolutePathToFile, nodeExtname(absolutePathToFile)); // (filename without extension)
        const extension_inc_dot = nodeExtname(absolutePathToFile);

        return {
            type: 'file',
            basename,
            extension: extension_inc_dot.replace(/^\./, ''),
            extension_inc_dot,
            name,
            dirname: dirname,
            uri: `${dirname ? `${dirname}/` : ''}${basename}`
        };
    }catch(e) {
        if( throwError ) {
            throw e;
        } else {
            return undefined;
        }
    }
}