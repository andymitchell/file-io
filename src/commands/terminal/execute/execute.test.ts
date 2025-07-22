// execute.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execute } from './execute.ts';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { privatifyPath } from '../../../utils/privatifyPath.ts';

describe('execute', () => {
    let tempDir: string;
    let testFilePath: string;
    let testSubDir: string;
    let testSubDirFilePath: string;

    beforeAll(async () => {
        // Create a temporary directory for our test files
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'execute-test-'));
        testFilePath = path.join(tempDir, 'test.js');
        testSubDir = path.join(tempDir, 'subdir');
        await fs.mkdir(testSubDir);
        testSubDirFilePath = path.join(testSubDir, 'test-cwd.js');

        // Create a simple executable Node.js script
        await fs.writeFile(testFilePath, 'console.log("hello world");');

        // Create a script in a subdirectory that logs the current working directory
        await fs.writeFile(testSubDirFilePath, 'console.log(process.cwd());');
    });

    afterAll(async () => {
        // Clean up the temporary directory
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('cwd option', () => {
        it('should execute a simple command and return stdout', async () => {
            const result = await execute(`node "${testFilePath}"`);
            expect(result.trim()).toBe('hello world');
        });

        it('should execute in a different cwd', async () => {
            const result = await execute(`node "${path.basename(testSubDirFilePath)}"`, { cwd: testSubDir });
            expect(result.trim()).toBe(privatifyPath(testSubDir));
        });
    })

    describe('error handling', () => {
        it('should handle command failure', async () => {
            await expect(execute('node -e "process.exit(1)"')).rejects.toThrow();
        });


        it('should throw an error for a non-existent command', async () => {
            await expect(execute('nonexistentcommand12345')).rejects.toThrow();
        });
    })

    describe('faux interactive', () => {

        
        it('should execute interactively', async () => {
            const result = await execute(`node "${testFilePath}"`, undefined, true);
            expect(result.trim()).toBe('hello world');
        });

        it('should handle interactive command failure', async () => {
            await expect(execute('node -e "process.exit(1)"', undefined, true)).rejects.toThrow();
        });
    })


});