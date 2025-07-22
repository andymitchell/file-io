// copyFileSync.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process, { cwd } from 'node:process';
import { copyFileSync } from './copyFileSync.ts'; // Adjust the import path as needed

describe('copyFileSync', () => {
    let tempDir: string;
    let sourceFile: string;
    let existingDestDir: string;
    let existingDestFile: string;

    // Create a temporary directory and seed it with files for testing
    beforeAll(() => {
        tempDir = path.join(os.tmpdir(), `vitest-copy-test-${Date.now()}`);
        mkdirSync(tempDir, { recursive: true });

        // Setup source file
        const sourceDir = path.join(tempDir, 'source');
        mkdirSync(sourceDir);
        sourceFile = path.join(sourceDir, 'file.txt');
        writeFileSync(sourceFile, 'hello world');

        // Setup existing destination directory and file
        existingDestDir = path.join(tempDir, 'existing-dir');
        mkdirSync(existingDestDir);
        existingDestFile = path.join(existingDestDir, 'existing-file.txt');
        writeFileSync(existingDestFile, 'old content');
    });

    // Clean up the temporary directory after all tests are done
    afterAll(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });

    it('should copy a file to a new destination file path, creating directories as needed', () => {
        const destination = path.join(tempDir, 'new-dir', 'new-file.txt');
        const result = copyFileSync(sourceFile, destination);

        expect(result.success).toBe(true);
        // Ensure the absolute path is correctly resolved and returned
        expect(result.success && result.absoluteDestinationFile).toBe(path.resolve(destination));
        expect(existsSync(destination)).toBe(true);
        expect(readFileSync(destination, 'utf8')).toBe('hello world');
    });

    it('should overwrite an existing file if the overwrite option is true', () => {
        const result = copyFileSync(sourceFile, existingDestFile, { overwrite: true });

        expect(result.success).toBe(true);
        expect(existsSync(existingDestFile)).toBe(true);
        // Verify the content was overwritten
        expect(readFileSync(existingDestFile, 'utf8')).toBe('hello world');
    });

    it('should copy a file into an existing directory', () => {
        const result = copyFileSync(sourceFile, existingDestDir);
        const finalFile = path.join(existingDestDir, path.basename(sourceFile));

        expect(result.success).toBe(true);
        expect(existsSync(finalFile)).toBe(true);
        expect(readFileSync(finalFile, 'utf8')).toBe('hello world');
    });

    it('should copy a file into a new directory when destination path ends with a separator', () => {
        const destination = path.join(tempDir, 'new-dir-with-sep') + path.sep;
        const result = copyFileSync(sourceFile, destination);
        const finalFile = path.join(destination, path.basename(sourceFile));
        
        expect(result.success).toBe(true);
        expect(existsSync(finalFile)).toBe(true);
        expect(readFileSync(finalFile, 'utf8')).toBe('hello world');
    });

    it('should return an error if the source file does not exist', () => {
        const nonExistentSource = path.join(tempDir, 'non-existent-file.txt');
        const destination = path.join(tempDir, 'some-destination.txt');
        const result = copyFileSync(nonExistentSource, destination);

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe(`Source file does not exist: ${nonExistentSource}`);
    });

    it('should return an error if destination file exists and overwrite is not enabled', () => {
        // We use a fresh file to avoid state from the overwrite test
        const destFile = path.join(tempDir, 'no-overwrite.txt');
        writeFileSync(destFile, 'original');

        const result = copyFileSync(sourceFile, destFile, { overwrite: false });
        
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe(`Destination file already exists and overwrite is not enabled: ${destFile}`);
        // Ensure the original file was not touched
        expect(readFileSync(destFile, 'utf8')).toBe('original');
    });

    it('should return an error by default if destination file exists', () => {
        const destFile = path.join(tempDir, 'no-overwrite-default.txt');
        writeFileSync(destFile, 'original');

        const result = copyFileSync(sourceFile, destFile);

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe(`Destination file already exists and overwrite is not enabled: ${destFile}`);
    });

    describe('with relative and absolute paths', () => {
        let testDir:string;
        let absoluteSource:string;
        const relativeSource = 'source.txt';
        let originalCwd: string;

        beforeEach(() => {

            testDir = path.join(tempDir, 'path-tests');
            absoluteSource = path.join(testDir, relativeSource);
            
            mkdirSync(testDir, { recursive: true });
            writeFileSync(absoluteSource, 'relative path test');
            originalCwd = process.cwd();
            process.chdir(testDir);
        });

        afterEach(() => {
            process.chdir(originalCwd);
            rmSync(testDir, { recursive: true, force: true });
        });

        it('should handle relative source and relative destination', () => {
            const relativeDest = 'destination.txt';
            const result = copyFileSync(relativeSource, relativeDest);
            
            expect(result.success).toBe(true);
            const absoluteDest = path.join(cwd(), relativeDest);
            expect(result.success && result.absoluteDestinationFile).toBe(absoluteDest);
            expect(readFileSync(absoluteDest, 'utf8')).toBe('relative path test');
        });

        it('should handle absolute source and relative destination', () => {
            const relativeDest = 'destination.txt';
            const result = copyFileSync(absoluteSource, relativeDest);

            expect(result.success).toBe(true);
            const absoluteDest = path.join(cwd(), relativeDest);
            expect(result.success && result.absoluteDestinationFile).toBe(absoluteDest);
            expect(readFileSync(absoluteDest, 'utf8')).toBe('relative path test');
        });

        it('should handle relative source and absolute destination', () => {
            const absoluteDest = path.join(testDir, 'destination.txt');
            const result = copyFileSync(relativeSource, absoluteDest);

            expect(result.success).toBe(true);
            expect(result.success && result.absoluteDestinationFile).toBe(absoluteDest);
            expect(readFileSync(absoluteDest, 'utf8')).toBe('relative path test');
        });
        
        it('should copy to a relative directory path', () => {
            const relativeDestDir = 'dest-dir/';
            mkdirSync(relativeDestDir);
            const result = copyFileSync(relativeSource, relativeDestDir);

            const expectedFile = path.join(cwd(), relativeDestDir, relativeSource);
            expect(result.success).toBe(true);
            expect(result.success && result.absoluteDestinationFile).toBe(expectedFile);
            expect(existsSync(expectedFile)).toBe(true);
        });
    });

    describe('with throwError enabled', () => {
        it('should throw an error if the source file does not exist', () => {
            const nonExistentSource = path.join(tempDir, 'non-existent-source.txt');
            const destination = 'dest.txt';

            expect(() => {
                copyFileSync(nonExistentSource, destination, undefined, true);
            }).toThrow(`Source file does not exist: ${nonExistentSource}`);
        });

        it('should throw an error if destination exists and overwrite is false', () => {
            const destFile = path.join(tempDir, 'throw-on-exist.txt');
            writeFileSync(destFile, 'do not overwrite');

            expect(() => {
                copyFileSync(sourceFile, destFile, { overwrite: false }, true);
            }).toThrow(`Destination file already exists and overwrite is not enabled: ${destFile}`);
        });

        it('should throw an error if destination exists and no options are provided', () => {
            const destFile = path.join(tempDir, 'throw-on-exist-default.txt');
            writeFileSync(destFile, 'do not overwrite');

            expect(() => {
                copyFileSync(sourceFile, destFile, undefined, true);
            }).toThrow(`Destination file already exists and overwrite is not enabled: ${destFile}`);
        });
    });
});