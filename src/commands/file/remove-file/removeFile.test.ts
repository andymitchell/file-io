import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { removeFile } from './removeFile.ts';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync, writeFileSync, rmSync, chmodSync, existsSync, mkdirSync } from 'node:fs';

// Create a temporary directory for our tests

const baseTempDir = mkdtempSync(join(tmpdir(), 'vitest-removefile-'));

// Cleanup the temporary directory after all tests have run
beforeAll(() => {
    // You can add any setup needed for all tests here
});

afterAll(() => {
    rmSync(baseTempDir, { recursive: true, force: true });
});

describe('removeFile', () => {

    it('should successfully remove an existing file and return success', () => {
        const filePath = join(baseTempDir, 'test-file-to-remove.txt');
        writeFileSync(filePath, 'test content');

        const result = removeFile(filePath);

        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(existsSync(filePath)).toBe(false);
    });

    it('should return success if the file does not exist', () => {
        const nonExistentFilePath = join(baseTempDir, 'non-existent-file.txt');
        const result = removeFile(nonExistentFilePath);

        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should return an error when trying to remove a file in a non-writable directory', () => {
        // Create a dedicated, non-writable directory for this test
        const permTestDir = join(baseTempDir, 'perm-test-dir');
        mkdirSync(permTestDir);

        const filePath = join(permTestDir, 'file-in-readonly-dir.txt');
        writeFileSync(filePath, 'test content');

        // Make the PARENT DIRECTORY read-only
        chmodSync(permTestDir, 0o555); // Read & Execute permissions

        const result = removeFile(filePath);

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toContain('EACCES'); // More specific check

        // Cleanup for this specific test
        chmodSync(permTestDir, 0o755); // Restore write permissions to allow cleanup
        rmSync(permTestDir, { recursive: true, force: true });
    });

    it('should throw an error when throwError is true and removal fails', () => {
        const permTestDir = join(baseTempDir, 'perm-throw-test-dir');
        mkdirSync(permTestDir);
        const filePath = join(permTestDir, 'file-to-throw.txt');
        writeFileSync(filePath, 'test content');

        // Make the PARENT DIRECTORY read-only
        chmodSync(permTestDir, 0o555);

        expect(() => removeFile(filePath, true)).toThrow();

        // Cleanup
        chmodSync(permTestDir, 0o755);
        rmSync(permTestDir, { recursive: true, force: true });
    });

    it('should return an error for an empty string path', () => {
        const result = removeFile('');
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
    });

    it('should return an error when the path is a directory', () => {
        const directoryPath = mkdtempSync(join(baseTempDir, 'test-directory'));

        const result = removeFile(directoryPath);
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
    });
});