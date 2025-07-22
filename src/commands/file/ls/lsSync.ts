import { globSync, type GlobOptions } from 'glob';
import { basename } from 'path';


import type { LsOptions } from './types.ts';
import { getErrorMessage } from '../../../utils/getErrorMessage.ts';
import type { PathInfo } from '../path-info/types.ts';
import { pathInfoSync } from '../path-info/pathInfoSync.ts';
import { absolute } from '../absolute/absolute.ts';
import { statSync } from 'fs';



type Response = {success: true, contents: PathInfo[], error?: undefined} | {success: false, contents: PathInfo[], error: Error};


/**
 * Synchronously lists files and/or directories under a given directory.
 *
 * Designed to be easier to remember than glob, and safer than readdir* (it handles symlinks 
 * while avoiding infinite loops).
 * 
 * @param absolutePathDirectory Absolute path to the directory to list contents from.
 * @param options Optional filtering and behavior controls:
 * @param throwError Optional  throws an error instead of returning it 
 * 
 * - `recursive` — Whether to search subdirectories. Default: `false`
 * - `type` — `'file'`, `'dir'`, or `'both'`. Default: `'both'`
 * - `file_pattern` — Filter filenames by glob pattern (string) or RegExp. RegExp is slower. Default: `null`
 * - `follow` — Whether to follow symlinks during recursive search. Default: `false`
 * - `ignore` — Glob-style ignore patterns. Default: `[]`
 * - `globOptions` — Additional options passed to `glob`. Note: `cwd` and `absolute` are ignored.
 * 
 * @returns Array of `PathInfo` objects, describing the matched files/directories.
 * 
 * @throws Will throw an error if the listing operation fails.
 * 
 * 
 * @example
 * // List all files and directories (non-recursive) in `/some/folder`
 * const items = lsSync('/some/folder');
 * 
 * @example
 * // List all files (non-recursive) in `/some/folder`
 * const items = lsSync('/some/folder', { type: 'file' });
 * 
 * @example
 * // List all `.ts` files recursively
 * const tsFiles = lsSync('/project/src', { 
 *   recursive: true,
 *   type: 'file',
 *   file_pattern: '*.ts' 
 * });
 * 
 * @example
 * // List only files matching `/^test/i` (case-insensitive) in the given directory
 * const dirs = lsSync('/project', {
 *   file_pattern: /^test/i  // using `file_pattern` forces `type` to be `file`
 * });
 * 
 * @example
 * // List everything except node_modules
 * const all = lsSync('/project', { 
 *   recursive: true,
 *   ignore: ['** /node_modules/**']  // remove space in the glob pattern
 * });
 */
export function lsSync(pathToDirectory: string, options?: LsOptions, throwError?: boolean):Response {
    try {
        const contents = _lsSync(pathToDirectory, options);

        return {success: true, contents}
    } catch(e) {
        let error:Error;
        if( e instanceof Error ) {
            error = e;
        } else {
            let serializedError:string | undefined;
            try {
                serializedError = JSON.stringify(e);
            } catch(e) {}
            error = new Error(`Unknown error: ${serializedError ?? 'na'}`);
        }
        

        if( throwError ) {
            throw error;
        } else {
            return {success: false, error, contents: [] };
        }
    }

    
}

function _lsSync(pathToDirectory: string, options?: LsOptions):PathInfo[] {
    /* Design decisions:
    - use glob, even though it's large
        - this is a node-thing, not web. Size isn't a huge problem. 
    - not using readdirSync/readdir 
        - it follows symlinks and will hang forever if they're circular 
    */


    

    // Set default options
    if( options?.file_pattern ) options.type = 'file';
    const safeOptions:Required<LsOptions> = {
        recursive: false,
        follow: false,
        type: 'both',
        ignore: [],
        file_pattern: null,
        globOptions: {},
        ...options,
    };

    try {

        const absolutePathDirectory = absolute(pathToDirectory);

        if( !statSync(absolutePathDirectory).isDirectory() ) {
            throw new Error(`This only works on directories. Not a directory: ${absolutePathDirectory}`);
        }

        // If file_pattern is a string, weave it into the glob pattern for efficiency.
        // Otherwise, use a broad pattern that will be filtered later by the RegExp.
        const fileMatchPattern = typeof safeOptions.file_pattern === 'string'
            ? safeOptions.file_pattern
            : '*';

        const directoryPattern = safeOptions.recursive
            ? `**/${fileMatchPattern}`
            : fileMatchPattern;

        const pattern = `${directoryPattern}${safeOptions.type==='dir'? '/' : ''}`;

        const globOptions: GlobOptions = {
            nodir: safeOptions.type==='file',
            follow: safeOptions.follow && safeOptions.type!=='file',
            ...options?.globOptions,

            // options.globOptions cannot override cwd and absolute, or it breaks the core logic 
            cwd: absolutePathDirectory,
            absolute: true 
        };


        // In the failing test, this is: {cwd: '/var/folders/wn/m1t3t49j2ts2brb2g5jn02q40000gn/T/vitest-glob-test-3tEB1j', nodir: true, follow: false, absolute: true}
        // Note 'absolute' makes no different to how it behaves 

        // Build the ignore patterns if the exclude option is provided
        if (safeOptions.ignore && Array.isArray(safeOptions.ignore)) {
            globOptions.ignore = safeOptions.ignore;
        }

        // Let glob find the files, now with exclusions
        // Note: With default glob options, filePaths is string[]. Using .toString() for robustness against different type configurations.
        let filePaths = globSync(pattern, globOptions) as string[];
        if( filePaths[0] && typeof filePaths[0]!=='string' ) throw new Error("Expected strings");
        

        // If a file_pattern is a RegExp, filter the results post-glob.
        const filePatternRegExp = safeOptions.file_pattern;
        if (filePatternRegExp instanceof RegExp) {
            
            filePaths = filePaths.filter(filePath => {
                // basename includes the extension, so the RegExp will test against the full filename (e.g., 'file.ts').
                return filePatternRegExp.test(basename(filePath.toString()));
            });
        }

        // Map the results to the desired object structure
        const results = filePaths.map(filePath => {
            // Ensure filePath is a string before passing to path functions.
            const pathStr = filePath.toString();
            return pathInfoSync(pathStr, true)
        });

        if( safeOptions.type==='file' ) {
            // glob will pick up dir-symlinks as a file, even with the noDir, so they need to be rooted out 
            return results.filter(x => x.type==='file');
        } else {
            return results;
        }

    } catch (e) {
        throw new Error(`Cannot list files for ${pathToDirectory}. Error: ${getErrorMessage(e)}`);
    }
}

