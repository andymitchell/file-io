

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, rmdirSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { removeDirectory } from './removeDirectory.ts';
import { tmpdir } from 'node:os';

// Helper function to create a temporary directory for tests
const createTestDir = (testName: string) => {
    const rootTestDir = join(tmpdir(), 'fileio-rem-dir-tests');
    const tmpDir = join(rootTestDir, testName);
    if (existsSync(tmpDir)) {
        //fs.rmSync instead of rmdirSync
        rmdirSync(tmpDir, { recursive: true });
    }
    mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
};

describe('removeDirectory', () => {
    let testDir: string;

    beforeEach(() => {
        testDir = createTestDir('removeDirectoryTest');
    });

    afterEach(() => {
        if (existsSync(testDir)) {
            //fs.rmSync instead of rmdirSync
            rmdirSync(testDir, { recursive: true });
        }
    });

    it('should successfully remove an empty directory', () => {
        const dirToRemove = join(testDir, 'emptyDir');
        mkdirSync(dirToRemove);

        const result = removeDirectory(dirToRemove);

        expect(result.success).toBe(true);
        expect(existsSync(dirToRemove)).toBe(false);
    });

    describe('force option', () => {
        it('should successfully remove a non-empty directory with the force option', () => {
            const dirToRemove = join(testDir, 'notEmptyDir');
            mkdirSync(dirToRemove);
            writeFileSync(join(dirToRemove, 'file.txt'), 'hello');

            const result = removeDirectory(dirToRemove, true);

            expect(result.success).toBe(true);
            expect(existsSync(dirToRemove)).toBe(false);
        });

        it('should not remove a non-empty directory without the force option', () => {
            const dirToRemove = join(testDir, 'notEmptyDirNoForce');
            mkdirSync(dirToRemove);
            writeFileSync(join(dirToRemove, 'file.txt'), 'hello');

            const result = removeDirectory(dirToRemove);

            expect(result.success).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('is not empty');
            expect(existsSync(dirToRemove)).toBe(true);
        });


        it('should handle nested directories correctly with the force option', () => {
            const parentDir = join(testDir, 'parent');
            const childDir = join(parentDir, 'child');
            mkdirSync(childDir, { recursive: true });
            writeFileSync(join(childDir, 'file.txt'), 'nested file');

            const result = removeDirectory(parentDir, true);
            expect(result.success).toBe(true);
            expect(existsSync(parentDir)).toBe(false);
        });
    })

    describe('error handling', () => {
        it('should return success if the directory does not exist', () => {
            const nonExistentDir = join(testDir, 'nonExistent');
            const result = removeDirectory(nonExistentDir);
            expect(result.success).toBe(true);
        });


        it('should return an error when trying to remove a file instead of a directory', () => {
            const fileAsDir = join(testDir, 'fileAsDir.txt');
            writeFileSync(fileAsDir, 'I am a file');

            const result = removeDirectory(fileAsDir);

            expect(result.success).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(existsSync(fileAsDir)).toBe(true);
        });
    })

    describe('symlinks', () => {
        it('should not remove a directory with a symlink if force is false', () => {
            const dirToRemove = join(testDir, 'dirWithSymlink');
            const symlinkTarget = join(testDir, 'symlinkTarget');
            mkdirSync(dirToRemove);
            mkdirSync(symlinkTarget);
            writeFileSync(join(symlinkTarget, 'file.txt'), 'original file');

            const symlinkPath = join(dirToRemove, 'theSymlink');
            symlinkSync(symlinkTarget, symlinkPath, 'dir');

            const result = removeDirectory(dirToRemove, false);

            expect(result.success).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('is not empty');
            expect(existsSync(dirToRemove)).toBe(true);
            expect(existsSync(symlinkTarget)).toBe(true);
        });

        it('should remove a symlink within a directory with force: true, but not the symlinked directory', () => {
            const dirToRemove = join(testDir, 'dirWithSymlinkForced');
            const symlinkTarget = join(testDir, 'symlinkTargetForced');
            mkdirSync(dirToRemove);
            mkdirSync(symlinkTarget);
            writeFileSync(join(symlinkTarget, 'file.txt'), 'original file');

            const symlinkPath = join(dirToRemove, 'theSymlink');
            symlinkSync(symlinkTarget, symlinkPath, 'dir');

            const result = removeDirectory(dirToRemove, true);

            expect(result.success).toBe(true);
            expect(existsSync(dirToRemove)).toBe(false);
            expect(existsSync(symlinkTarget)).toBe(true);
            expect(existsSync(join(symlinkTarget, 'file.txt'))).toBe(true);
        });
    })
});