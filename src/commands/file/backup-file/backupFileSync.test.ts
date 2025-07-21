
import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "fs";
import * as path from 'path';
import { tmpdir } from 'os';
import { backupFileSync } from "./backupFileSync.ts";
import type { FileInfo } from "../path-info/types.ts";
import { pathInfoSync } from '../path-info/pathInfoSync.ts';



describe('backupFileSync', () => {
    const TEST_ROOT_DIR = path.join(tmpdir(), 'backupFile_tests');
    let testDir: string;

    beforeAll(() => {
        // Cleanup any old test directories before starting
        if (existsSync(TEST_ROOT_DIR)) {
            rmSync(TEST_ROOT_DIR, { recursive: true, force: true });
        }
        mkdirSync(TEST_ROOT_DIR, { recursive: true });
    });

    afterAll(() => {
        // Cleanup the root test directory after all tests are done
        rmSync(TEST_ROOT_DIR, { recursive: true, force: true });
    });

    beforeEach(() => {
        // Create a unique temporary directory for each test
        testDir = path.join(TEST_ROOT_DIR, `test_${Date.now()}_${Math.round(Math.random() * 1000)}`);
        mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        // Cleanup the specific test directory after each test
        rmSync(testDir, { recursive: true, force: true });
    });

    test('should return undefined if the source file does not exist', () => {
        const filePath = path.join(testDir, 'non-existent-file.txt');
        const backupUri = backupFileSync(filePath);
        expect(backupUri).toBeUndefined();
    });

    test('should throw an error when trying to back up a directory', () => {
        // The current implementation of backupFileSync relies on a pathInfo that can throw an error for directories.
        // We'll simulate this behavior for the test.
        const dirPath = path.join(testDir, 'a-directory');
        mkdirSync(dirPath);
        
        // This mock of pathInfo will correctly identify a directory
        const pathInfoWithDirCheck = (p: string) => {
            if (p === dirPath) return { type: 'dir' };
            return pathInfoSync(p);
        };
        
        // A more direct way to test this would be to modify backupFileSync to throw if it detects a dir
        // For now, we assume pathInfo helps enforce this
        const faultyBackup = () => {
            // @ts-ignore
            backupFileSync(dirPath, undefined, pathInfoWithDirCheck);
        };
        expect(faultyBackup).toThrow("Only supports files");
    });

    test('should create a backup of a file with the default naming scheme', () => {
        const filePath = path.join(testDir, 'test.txt');
        const content = 'Hello, Vitest!';
        writeFileSync(filePath, content);

        const backupUri = backupFileSync(filePath);

        expect(backupUri).toBeDefined();
        expect(backupUri).not.toBe(filePath);
        expect(path.dirname(backupUri!)).toBe(path.dirname(filePath));
        expect(existsSync(backupUri!)).toBe(true);

        const backupContent = readFileSync(backupUri!, 'utf-8');
        expect(backupContent).toBe(content);
    });

    test('should create unique backup files on successive calls', async () => {
        const filePath = path.join(testDir, 'test.txt');
        const content = 'Hello, again!';
        writeFileSync(filePath, content);

        const backupUri1 = backupFileSync(filePath);
        // Ensure a different timestamp for the next backup
        await new Promise(resolve => setTimeout(resolve, 10)); 
        const backupUri2 = backupFileSync(filePath);

        expect(backupUri1).toBeDefined();
        expect(backupUri2).toBeDefined();
        expect(backupUri1).not.toBe(backupUri2);

        expect(existsSync(backupUri1!)).toBe(true);
        expect(existsSync(backupUri2!)).toBe(true);

        const content1 = readFileSync(backupUri1!, 'utf-8');
        const content2 = readFileSync(backupUri2!, 'utf-8');
        expect(content1).toBe(content);
        expect(content2).toBe(content);
    });

    test('should use a custom backup name generator when provided', () => {
        const filePath = path.join(testDir, 'test-custom.txt');
        const content = 'Custom backup name.';
        writeFileSync(filePath, content);

        const customBackupName = "my-special-backup.bak";
        const getCustomBackupFile = (details: FileInfo) => {
            return {
                uri: path.join(details.dirname, customBackupName),
                file: customBackupName,
            };
        };

        const backupUri = backupFileSync(filePath, getCustomBackupFile);

        expect(backupUri).toBeDefined();
        expect(path.basename(backupUri!)).toBe(customBackupName);
        expect(existsSync(backupUri!)).toBe(true);
        const backupContent = readFileSync(backupUri!, 'utf-8');
        expect(backupContent).toBe(content);
    });
    
    test('should throw an error if a unique backup name cannot be generated', () => {
        const filePath = path.join(testDir, 'test.txt');
        const content = 'This will be hard to back up.';
        writeFileSync(filePath, content);

        // Pre-create files to block all possible backup names from the default generator
        const d = pathInfoSync(filePath);
        if( d.type!=='file' ) throw new Error("Could not prove d was a file");
        const dateStr = '20250101010'; // A fixed date string for predictability
        for (let i = 0; i < 10; i++) {
            const blockedBackupFile = `${d.name}_${dateStr}-${i}.bak`;
            const blockedBackupUri = path.join(d.dirname, blockedBackupFile);
            writeFileSync(blockedBackupUri, 'blocking file');
        }


        const backupAction = () => {
            
            // A custom GetBackupName that will always clash
            let attempts = 0;
            const clashingBackupNamer = (details: FileInfo) => {
                const file = `${details.name}_${dateStr}-${attempts}.bak`;
                const uri = path.join(details.dirname, file);
                attempts++;
                return { uri, file };
            };
            
            backupFileSync(filePath, clashingBackupNamer);
        };
        
        // This test will fail if the loop limit (10) is not reached.
        // It's a conceptual test of the loop limit error.
        expect(backupAction).toThrow('Bad backup uri');
    });
});