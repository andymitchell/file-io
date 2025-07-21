import { globSync, type GlobOptions } from 'glob';
import { basename, dirname } from 'path';

import { getErrorMessage } from '../../utils/getErrorMessage.ts';
import type { ListedFile, ListFileOptions } from './types.ts';






/**
 * A helpful wrapper around glob that's easier/faster to remember 
 * 
 * @param absolutePathDirectory The initial directory
 * @param options `ListFileOptions`
 * @returns 
 */
export function listDirFiles(absolutePathDirectory: string, options?: ListFileOptions):ListedFile[] {
    /* Design decisions:
    - use glob, even though it's large
        - this is a node-thing, not web. Size isn't a huge problem. 
    - not using readdirSync/readdir 
        - it follows symlinks and will hang forever if they're circular 
    */


    // Set default options
    const effectiveOptions = {
        recurse: false,
        follow: false,
        ...options,
    };

    try {
        // If file_pattern is a string, weave it into the glob pattern for efficiency.
        // Otherwise, use a broad pattern that will be filtered later by the RegExp.
        const fileMatchPattern = typeof effectiveOptions.file_pattern === 'string'
            ? effectiveOptions.file_pattern
            : '*';

        const pattern = effectiveOptions.recurse
            ? `**/${fileMatchPattern}`
            : fileMatchPattern;

        const globOptions: GlobOptions = {
            nodir: true,
            follow: effectiveOptions.follow,
            ...options?.globOptions,

            // options.globOptions cannot override cwd and absolute, or it breaks the core logic 
            cwd: absolutePathDirectory,
            absolute: true 
        };


        console.log({globOptions})
        // In the failing test, this is: {cwd: '/var/folders/wn/m1t3t49j2ts2brb2g5jn02q40000gn/T/vitest-glob-test-3tEB1j', nodir: true, follow: false, absolute: true}
        // Note 'absolute' makes no different to how it behaves 

        // Build the ignore patterns if the exclude option is provided
        if (effectiveOptions.ignore && Array.isArray(effectiveOptions.ignore)) {
            globOptions.ignore = effectiveOptions.ignore;
        }

        // Let glob find the files, now with exclusions
        // Note: With default glob options, filePaths is string[]. Using .toString() for robustness against different type configurations.
        let filePaths = globSync(pattern, globOptions) as string[];
        if( filePaths[0] && typeof filePaths[0]!=='string' ) throw new Error("Expected strings");
        
        console.log({filePaths})

        // If a file_pattern is a RegExp, filter the results post-glob.
        const filePatternRegExp = effectiveOptions.file_pattern;
        if (filePatternRegExp instanceof RegExp) {
            
            filePaths = filePaths.filter(filePath => {
                // basename includes the extension, so the RegExp will test against the full filename (e.g., 'file.ts').
                return filePatternRegExp.test(basename(filePath.toString()));
            });
        }

        // Map the results to the desired object structure
        return filePaths.map(filePath => {
            // Ensure filePath is a string before passing to path functions.
            const pathStr = filePath.toString();
            const file = basename(pathStr);
            const path = dirname(pathStr);
            return {
                basename: file,
                dirname: path,
                uri: pathStr
            };
        });

    } catch (e) {
        throw new Error(`Cannot list files for ${absolutePathDirectory}. Error: ${getErrorMessage(e)}`);
    }
}


/*

Testing plan: 

Before all, create a tmp directory with a wide range of files that'll be used by every test. (Delete this after all tests complete). 
Do not use mocks. 

In describe blocks: 
- Test what it returns (basename/dirname/uri), matching the expectation in ListedFile 
- Test that if told to recurse, it will 
- Test the file pattern
    - Do the same test for a string glob, and a reg exp, and expect them to return the same
- Verify it will not follow sym links by default
    - But can if needed
- Test the 'ignore' option is passed through, and it will correctly ignore a dir in any path as described in the options' JSDoc
- Test that if given complete globOptions, it'll override any setting given 


*/