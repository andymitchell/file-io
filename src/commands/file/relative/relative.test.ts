import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { inferIsDirectory, relative } from './relative.ts';

import { stripTrailingSep } from '../strip-trailing-sep/stripTrailingSep.ts';

// This describe block encapsulates all tests for the 'relative' function.
describe('relative with real file system', () => {
    let baseDir: string;

    // Paths for directories and files that will be created for testing.
    let dir1: string;
    let dir2: string;
    let file1_in_dir1: string;
    let file2_in_dir2: string;
    let file3_in_base: string;
    let file4_in_base_noext: string;

    /**
     * Before any tests run, create a temporary directory structure.
     * This setup is executed once.
     */
    beforeAll(async () => {
        // Create a unique temporary directory for the test run to avoid conflicts.
        baseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vitest-relative-test-'));

        // Define paths for our test structure.
        dir1 = path.join(baseDir, 'dir1');
        dir2 = path.join(dir1, 'dir2');
        file1_in_dir1 = path.join(dir1, 'file1.txt');
        file2_in_dir2 = path.join(dir2, 'file2.txt');
        file3_in_base = path.join(baseDir, 'file3.txt');
        file4_in_base_noext = path.join(baseDir, 'file4');

        // Create the directories and empty files.
        await fs.mkdir(dir1);
        await fs.mkdir(dir2);
        await fs.writeFile(file1_in_dir1, 'content');
        await fs.writeFile(file2_in_dir2, 'content');
        await fs.writeFile(file3_in_base, 'content');
        await fs.writeFile(file4_in_base_noext, 'content');
    });

    /**
     * After all tests have completed, remove the temporary directory.
     * This cleanup is crucial to prevent littering the file system.
     */
    afterAll(async () => {
        await fs.rm(baseDir, { recursive: true, force: true });
    });


    // Test case: From a directory to a subdirectory.
    it('should return relative path from a directory to a subdirectory', () => {
        expect(relative(baseDir, dir1)).toBe('./dir1');
    });

    // Test case: From a directory to a file within it.
    it('should return relative path from a directory to a file in it', () => {
        expect(relative(baseDir, file3_in_base)).toBe('./file3.txt');
    });

    // Test case: From a directory to a file in a subdirectory.
    it('should return relative path from a directory to a file in a subdirectory', () => {
        expect(relative(baseDir, file2_in_dir2)).toBe('./dir1/dir2/file2.txt');
    });

    // Test case: From a file to another file in the same directory.
    it('should return relative path from a file to a file in the same directory', () => {
        // Note: node:path's relative function works from the containing directory of the first arg.
        expect(relative(file3_in_base, file1_in_dir1)).toBe('./dir1/file1.txt');
    });

    // Test case: Navigating up the tree ('../').
    it('should return a path starting with ../ from a subdirectory to a file in parent', () => {
        expect(relative(dir1, file3_in_base)).toBe('../file3.txt');
    });

    // Test case: Navigating up multiple levels.
    it('should handle multi-level upward navigation', () => {
        expect(relative(dir2, file3_in_base)).toBe('../../file3.txt');
    });

    // Test case: From a file deep in the hierarchy to a file at the base.
    it('should return a path from a deep file to a base file', () => {
        expect(relative(file2_in_dir2, file3_in_base)).toBe('../../file3.txt');
    });

    // Test case: From a directory to its parent directory.
    it('should return ".." when navigating from a directory to its parent', () => {
        expect(relative(dir1, baseDir)).toBe('./..');
    });

    // Test case: When 'from' and 'to' paths are identical.
    it('should return "." if the paths are identical (never trailing slash', () => {
        const result = relative(dir1, dir1);
        expect(result).toBe('.');
    });

    // Test case: Ensuring a trailing slash on the 'to' argument is correctly handled.
    it('should strip the trailing slash from the result', () => {
        // Pass the 'to' directory with a trailing slash.
        expect(relative(baseDir, dir1 + '/')).toBe('./dir1');
    });

    describe('inferIsDirectory', () => {
        it('should be able to tell if its a real file, even with no extension', () => {
            expect(inferIsDirectory(file4_in_base_noext)).toBe(false);
        })

        it('should be able to tell a directory if real, even with no trailing slash', () => {
            expect(inferIsDirectory(stripTrailingSep(baseDir))).toBe(true);
        })

        it('should be able to infer a non-existant directory with a trailing slash', () => {
            expect(inferIsDirectory('/')).toBe(true);
            expect(inferIsDirectory('./path/')).toBe(true);
        })

        it('should be able to infer a non-existant directory with a file pattern', () => {
            expect(inferIsDirectory('./path/file.txt')).toBe(false);
        })


        it('should fail if it cannot infer', () => {
            expect(inferIsDirectory('./path/filenoext')).toBe(undefined)
        })
        
    })

    it('verifies jsdoc examples and handles non-existent files', () => {

        
        expect(relative('usr/path/', 'usr/path')).toBe('.');

        expect(relative('usr/path/', 'usr/path/file.txt')).toBe('./file.txt');

        expect(relative('usr/path/', 'usr/')).toBe('./..');
        

        expect(relative('usr/path/', 'usr/file.txt')).toBe('../file.txt');
        

        expect(relative('usr/path/file2.txt', 'usr/file.txt')).toBe('../file.txt')
        

        expect(relative('usr/path/file2.txt', 'usr/')).toBe('./..');

    })
});