import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, isAbsolute } from 'node:path';
import { lsSync } from './lsSync.ts';

import type { PathInfo } from '../path-info/types.ts';

// Helper to sort results for stable comparison
const sortResults = (arr: PathInfo[]) => arr.sort((a, b) => a.uri.localeCompare(b.uri));


describe('lsSync', () => {
    let tempDir: string;
    let symlinkDir: string;
    

    // --- Setup and Teardown ---
    beforeAll(async () => {
        // Create a unique temporary directory for the entire test suite
        const baseTempDir = await mkdtemp(join(tmpdir(), 'fileio-glob-test-'));
        tempDir = join(baseTempDir, 'main');
        await mkdir(tempDir);


        symlinkDir = join(baseTempDir, 'symlinked');
        

        // Create a diverse file and directory structure
        await Promise.all([
            // Files at the root
            writeFile(join(tempDir, 'file1.ts'), 'content'),
            writeFile(join(tempDir, 'file2.js'), 'content'),
            writeFile(join(tempDir, 'README.md'), 'content'),

            // Subdirectory with files
            mkdir(join(tempDir, 'src')).then(() => Promise.all([
                writeFile(join(tempDir, 'src', 'main.ts'), 'content'),
                writeFile(join(tempDir, 'src', 'data.json'), 'content')
            ])),

            // Directory to be ignored
            mkdir(join(tempDir, '.git')).then(() => 
                writeFile(join(tempDir, '.git', 'config'), 'content')
            ),

            mkdir(symlinkDir).then(() => 
                writeFile(join(symlinkDir, 'linked-file.ts'), 'content'),
            )
            
            
            
        ]);
        
        // Create a symbolic link
        await symlink(symlinkDir, join(tempDir, 'link-to-dir'), 'dir');
    });

    afterAll(async () => {
        // Clean up the temporary directory after all tests are done
        await rm(tempDir, { recursive: true, force: true });
    });

    // --- Test Cases ---

    describe('Return value structure', () => {
        it('should return objects with basename, dirname, and an absolute uri', () => {
            const result = lsSync(tempDir, { file_pattern: 'file1.ts' })?.contents;

            expect(result).toHaveLength(1);
            const file = result[0]!;
            if( file.type!=='file' ) throw new Error("Expect file");

            expect(file.basename).toBe('file1.ts');
            expect(file.dirname).toBe(resolve(tempDir));
            expect(file.uri).toBe(resolve(tempDir, 'file1.ts'));
            expect(isAbsolute(file.uri)).toBe(true);
            expect(isAbsolute(file.dirname)).toBe(true);
        });
    });

    describe('recursive option', () => {
        it('should NOT find files in subdirectories by default', () => {
            const results = lsSync(tempDir)?.contents;
            const fileNames = results.filter(f => f.type==='file').map(f => f.basename);

            expect(fileNames).toContain('file1.ts');
            expect(fileNames).not.toContain('main.ts');
        });

        it('should find files in subdirectories when recursive is true', () => {
            const results = lsSync(tempDir, { recursive: true })?.contents;
            const fileNames = results.filter(f => f.type==='file').map(f => f.basename);
            
            expect(fileNames).toContain('file1.ts');
            expect(fileNames).toContain('main.ts');
            expect(fileNames).toContain('data.json');
        });
    });

    describe('file_pattern option', () => {
        it('should return identical results for equivalent string and RegExp patterns', () => {
            const globPattern = '**/*.ts'; // double-star to match recursive: true
            const regExpPattern = /\.ts$/;

            const fromGlob = lsSync(tempDir, { file_pattern: globPattern, recursive: true })?.contents;
            const fromRegExp = lsSync(tempDir, { file_pattern: regExpPattern, recursive: true })?.contents;

            // Sort to ensure order doesn't affect comparison
            expect(sortResults(fromGlob)).toEqual(sortResults(fromRegExp));
            expect(fromGlob.length).toBeGreaterThan(1); // Sanity check
        });

         it('should correctly filter with a RegExp pattern', () => {
            const results = lsSync(tempDir, { 
                file_pattern: /file\d\.(ts|js)/, 
                recursive: true 
            })?.contents;

            expect(sortResults(results).map(r => r.type==='file' && r.basename)).toEqual(['file1.ts', 'file2.js']);
        });

        it('should only return files', () => {
            const results1 = lsSync(tempDir, {
                file_pattern: 'src',
                recursive: true
            })?.contents
            expect(results1.length).toBe(0);

            const results2 = lsSync(tempDir, {
                file_pattern: /src/,
                recursive: true
            })?.contents
            expect(results2.length).toBe(0);

            const actuallyHasSrc = lsSync(tempDir, {recursive: true})?.contents;
            expect(actuallyHasSrc.some(x => x.type==='dir' && x.uri.endsWith('src'))).toBe(true);
        })
    });

    describe('type option', () => {
        it('returns files', () => {
            const results = lsSync(tempDir, {type: 'file'})?.contents;

            expect(results.length).toBeGreaterThan(0);
            console.log({results})
            expect(results.every(x => x.type==='file')).toBe(true);
        })

        it('returns directories', () => {
            const results = lsSync(tempDir, {type: 'dir'})?.contents;

            expect(results.length).toBeGreaterThan(0);
            console.log({results})
            expect(results.every(x => x.type==='dir')).toBe(true);
        })
    })

    describe('Symbolic links', () => {
        it('should NOT follow symlinks by default', () => {
            const results = lsSync(tempDir, { recursive: true })?.contents;
            const found = results.some(file => file.type==='file' && file.basename === 'linked-file.ts');

            expect(found).toBe(false);
        });

        it('should follow symlinks when follow: true is set', () => {
            const results = lsSync(tempDir, { recursive: true, follow: true })?.contents;
            const found = results.some(file => file.type==='file' && file.basename === 'linked-file.ts');

            expect(found).toBe(true);
        });
    });

    describe('Ignore option', () => {
        it('should ignore files and directories specified in the ignore array', () => {
            const results = lsSync(tempDir, { 
                recursive: true, 
                ignore: ['**/.git/**'] 
            })?.contents;
            const foundGitConfig = results.some(file => file.type==='file' && file.uri.includes('.git'));
            
            expect(foundGitConfig).toBe(false);

            // Sanity check: ensure other files are still found
            const foundMainTs = results.some(file => file.type==='file' && file.basename === 'main.ts');
            expect(foundMainTs).toBe(true);
        });
    });

    describe('globOptions override', () => {
        it('should prioritize globOptions over all other simplified options', () => {
            // Set simple options that contradict globOptions
            const simpleOptions = {
                recursive: true,
                follow: false,  // globOptions will set follow: true
            };
            
            // Override with specific glob settings
            const globOptions = {
                follow: true, 
            };

            const results = lsSync(tempDir, { ...simpleOptions, globOptions })?.contents;
            
            // Test if follow was overridden: 'linked-file.ts' should be found
            const foundLinkedFile = results.some(r => r.type==='file' && r.basename === 'linked-file.ts');
            expect(foundLinkedFile, "globOptions 'follow: true' should override 'follow: false'").toBe(true);

        });
    });


    describe('Error Handling and Invalid Input', () => {
        it('should return a failure response when path is a file, not a directory', () => {
            const filePath = join(tempDir, 'file1.ts');
            const result = lsSync(filePath);

            expect(result.success).toBe(false);
            expect(result.contents).toEqual([]);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('This only works on directories');
        });

        it('should return a failure response for a non-existent directory', () => {
            const nonExistentPath = join(tempDir, 'non-existent-dir');
            const result = lsSync(nonExistentPath);

            expect(result.success).toBe(false);
            expect(result.contents).toEqual([]);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('Cannot list files');
        });
    });


    describe('throwError option', () => {
        it('should return an error object by default when the path is invalid', () => {
            const filePath = join(tempDir, 'file1.ts'); // Invalid input
            
            // No try/catch needed, as it should return the error
            const result = lsSync(filePath, undefined, false);

            expect(result.success).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
        });

        it('should throw an error on invalid path when throwError is true', () => {
            const filePath = join(tempDir, 'file1.ts'); // Invalid input

            // Expect the function to throw an actual exception
            expect(() => {
                lsSync(filePath, undefined, true);
            }).toThrow('This only works on directories');
        });
    });


    describe('Edge Cases', () => {
        let edgeCaseDir: string;

        beforeAll(async () => {
            edgeCaseDir = join(tempDir, 'edge-cases');
            await mkdir(edgeCaseDir, { recursive: true });
        });

        it('should return an empty array for an empty directory', async () => {
            const emptyDir = join(edgeCaseDir, 'empty');
            await mkdir(emptyDir);

            const result = lsSync(emptyDir)?.contents;
            expect(result).toEqual([]);

            await rm(emptyDir, { recursive: true, force: true });
        });

        it('should return an empty array if all contents are ignored', async () => {
            const ignoredDir = join(edgeCaseDir, 'ignored-content');
            await mkdir(ignoredDir);
            await writeFile(join(ignoredDir, 'temp.log'), 'log data');
            await writeFile(join(ignoredDir, 'another.tmp'), 'temp data');

            const result = lsSync(ignoredDir, {
                recursive: true,
                ignore: ['**/*.log', '**/*.tmp']
            })?.contents;

            expect(result).toEqual([]);

            await rm(ignoredDir, { recursive: true, force: true });
        });
    });
});