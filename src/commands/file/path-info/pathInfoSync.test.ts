// src/path-info/pathInfoSync.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathInfoSync } from './pathInfoSync.ts';
import type { FileInfo, DirectoryInfo } from './types.ts';

// Create a unique temporary directory for this test run
const testDir = path.join(os.tmpdir(), `pathInfoSync-test-${Date.now()}`);

describe('pathInfoSync', () => {

    // Setup: Create a temporary directory with a structure to test against
    beforeAll(() => {
        fs.mkdirSync(testDir, { recursive: true });
        
        // Create directories
        fs.mkdirSync(path.join(testDir, 'sub-dir'));
        fs.mkdirSync(path.join(testDir, 'real-dir'));

        // Create various files for testing
        fs.writeFileSync(path.join(testDir, 'file.txt'), 'hello world');
        fs.writeFileSync(path.join(testDir, 'sub-dir', 'nested.js'), 'console.log("nested")');
        fs.writeFileSync(path.join(testDir, 'file-no-extension'), '');
        fs.writeFileSync(path.join(testDir, 'archive.tar.gz'), '');
        fs.writeFileSync(path.join(testDir, 'real-file.md'), '# content');
        fs.writeFileSync(path.join(testDir, 'no-extension'), 'oops i am typeless');

        // Create symbolic links for testing
        // Use 'dir' and 'file' type hints for cross-platform compatibility (especially Windows)
        fs.symlinkSync(path.join(testDir, 'real-dir'), path.join(testDir, 'dir-symlink'), 'dir');
        fs.symlinkSync(path.join(testDir, 'real-file.md'), path.join(testDir, 'file-symlink.md'), 'file');
    });


    // Teardown: Clean up the temporary directory after all tests are done
    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    describe('File Detection', () => {
        it('should return correct FileInfo for a file with an extension', () => {
            const filePath = path.join(testDir, 'file.txt');
            const result = pathInfoSync(filePath) as FileInfo;

            expect(result.type).toBe('file');
            expect(result.basename).toBe('file.txt');
            expect(result.extension).toBe('txt');
            expect(result.extension_inc_dot).toBe('.txt');
            expect(result.name).toBe('file');
            expect(result.dirname).toBe(testDir);
            expect(result.uri).toBe(filePath);
        });

        it('should return correct FileInfo for a file within a subdirectory', () => {
            const filePath = path.join(testDir, 'sub-dir', 'nested.js');
            const subDir = path.join(testDir, 'sub-dir');
            const result = pathInfoSync(filePath) as FileInfo;

            expect(result.type).toBe('file');
            expect(result.basename).toBe('nested.js');
            expect(result.name).toBe('nested');
            expect(result.extension).toBe('js');
            expect(result.dirname).toBe(subDir);
            expect(result.uri).toBe(filePath);
        });

        it('should return correct FileInfo for a file with no extension', () => {
            const filePath = path.join(testDir, 'file-no-extension');
            const result = pathInfoSync(filePath) as FileInfo;

            expect(result.type).toBe('file');
            expect(result.basename).toBe('file-no-extension');
            expect(result.name).toBe('file-no-extension');
            expect(result.extension).toBe('');
            expect(result.extension_inc_dot).toBe('');
            expect(result.dirname).toBe(testDir);
            expect(result.uri).toBe(filePath);
        });

        it('should correctly handle files with multiple dots in the name', () => {
            const filePath = path.join(testDir, 'archive.tar.gz');
            const result = pathInfoSync(filePath) as FileInfo;

            expect(result.type).toBe('file');
            expect(result.basename).toBe('archive.tar.gz');
            expect(result.name).toBe('archive.tar');
            expect(result.extension).toBe('gz');
            expect(result.extension_inc_dot).toBe('.gz');
            expect(result.dirname).toBe(testDir);
            expect(result.uri).toBe(filePath);
        });
    });

    describe('Directory Detection', () => {
        it('should return correct DirectoryInfo for a directory path', () => {
            const dirPath = path.join(testDir, 'sub-dir');
            const result = pathInfoSync(dirPath) as DirectoryInfo;

            expect(result.type).toBe('dir');
            expect(result.dirname).toBe(dirPath);
        });

        it('should return correct DirectoryInfo for a directory path with a trailing slash', () => {
            const dirPath = path.join(testDir, 'sub-dir');
            const pathWithSlash = dirPath + path.sep;
            const result = pathInfoSync(pathWithSlash) as DirectoryInfo;

            expect(result.type).toBe('dir');
            // The dirname should not have the trailing slash
            expect(result.dirname).toBe(dirPath);
        });
    });

    describe('Symbolic Link Handling', () => {
        it('should treat a symbolic link to a directory as a directory', () => {
            const symlinkPath = path.join(testDir, 'dir-symlink');
            const result = pathInfoSync(symlinkPath) as DirectoryInfo;

            expect(result.type).toBe('dir');
            // The dirname should be the path of the symlink itself
            expect(result.dirname).toBe(symlinkPath);
        });

        it('should treat a symbolic link to a file as a file', () => {
            const symlinkPath = path.join(testDir, 'file-symlink.md');
            const result = pathInfoSync(symlinkPath) as FileInfo;

            expect(result.type).toBe('file');
            expect(result.basename).toBe('file-symlink.md');
            expect(result.name).toBe('file-symlink');
            expect(result.extension).toBe('md');
            expect(result.extension_inc_dot).toBe('.md');
            expect(result.dirname).toBe(testDir);
            expect(result.uri).toBe(symlinkPath);
        });
    });

    /**
     * NOTE: This test covers the `if (dirname === '.')` condition in `pathInfoSync.ts`.
     * This line is only triggered when a relative path is passed to `path.dirname`,
     * which contradicts the function's type hint `absolutePathToFile: string`.
     * We include this test to achieve full coverage and highlight this defensive code path.
     */
    describe('Edge Case Coverage', () => {
        describe('relative paths', () => {
            let originalCwd: string;

            beforeAll(() => {
                originalCwd = process.cwd();
                process.chdir(testDir); // Change working directory to our temp dir
            });

            afterAll(() => {
                process.chdir(originalCwd); // Change back to original CWD
            });

            it('should handle relative paths correctly to cover the dirname === "." case', () => {
                // Passing a relative path, which path.dirname() will resolve to '.'
                const result = pathInfoSync('file.txt') as FileInfo;

                expect(result.type).toBe('file');
                expect(result.basename).toBe('file.txt');
                expect(result.dirname).toBe(''); // dirname becomes '' as per the function logic
                expect(result.name).toBe('file');
                expect(result.uri).toBe('file.txt'); // uri is constructed without a leading path
            });
        })

        it('will handle something with no extension', () => {
            const filePath = path.join(testDir, 'no-extension');
            const result = pathInfoSync(filePath) as FileInfo;

            console.log({result})
            expect(result.type).toBe('file');
            expect(result.basename).toBe('no-extension');
            expect(result.extension).toBe('');
            expect(result.extension_inc_dot).toBe('');
            expect(result.name).toBe('no-extension');
            expect(result.dirname).toBe(testDir);
            expect(result.uri).toBe(filePath);
        })
    });
});