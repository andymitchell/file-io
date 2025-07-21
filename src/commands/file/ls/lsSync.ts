import { globSync, type GlobOptions } from 'glob';
import { basename } from 'path';


import type { LsOptions } from './types.ts';
import { getErrorMessage } from '../../../utils/getErrorMessage.ts';
import type { PathInfo } from '../path-info/types.ts';
import { pathInfoSync } from '../path-info/pathInfoSync.ts';






/**
 * A helpful wrapper around glob that's easier/faster to remember 
 * 
 * @param absolutePathDirectory The initial directory
 * @param options `LsOptions`
 * @returns 
 */
export function lsSync(absolutePathDirectory: string, options?: LsOptions):PathInfo[] {
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


        console.log({globOptions})
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
        
        console.log({filePaths})

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
            return pathInfoSync(pathStr)
        });

        if( safeOptions.type==='file' ) {
            // glob will pick up dir-symlinks as a file, even with the noDir, so they need to be rooted out 
            return results.filter(x => x.type==='file');
        } else {
            return results;
        }

    } catch (e) {
        throw new Error(`Cannot list files for ${absolutePathDirectory}. Error: ${getErrorMessage(e)}`);
    }
}

