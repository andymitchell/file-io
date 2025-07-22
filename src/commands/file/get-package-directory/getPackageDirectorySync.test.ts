import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { getPackageDirectorySync } from './getPackageDirectorySync.ts';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { pathToFileURL } from 'node:url';

// --- Test Setup: Create a realistic temporary file structure ---

let tempDir: string;
let projectRootDir: string;
let srcDir: string;
let nodeModulesDir: string;
let myPackageDir: string;
let emptyDir: string;

let rootPackageJsonPath: string;
let modulePackageJsonPath: string;
let srcFilePath: string;
let moduleFilePath: string;

// Store the original CWD to restore it after tests
const originalCwd = process.cwd();

beforeAll(() => {
    // Create a unique temporary directory for the entire test run
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-dir-test-'));

    // Define the directory structure
    projectRootDir = path.join(tempDir, 'my-project');
    srcDir = path.join(projectRootDir, 'src');
    nodeModulesDir = path.join(projectRootDir, 'node_modules');
    myPackageDir = path.join(nodeModulesDir, 'myPackage');
    emptyDir = path.join(tempDir, 'empty');

    // Create the directories
    fs.mkdirSync(projectRootDir);
    fs.mkdirSync(srcDir);
    fs.mkdirSync(nodeModulesDir);
    fs.mkdirSync(myPackageDir);
    fs.mkdirSync(emptyDir);

    // Define file paths
    rootPackageJsonPath = path.join(projectRootDir, 'package.json');
    modulePackageJsonPath = path.join(myPackageDir, 'package.json');
    srcFilePath = path.join(srcDir, 'srcFile.ts');
    moduleFilePath = path.join(myPackageDir, 'packageFile.js');

    // Create dummy files
    fs.writeFileSync(rootPackageJsonPath, JSON.stringify({ name: 'root-project' }));
    fs.writeFileSync(modulePackageJsonPath, JSON.stringify({ name: 'my-package' }));
    fs.writeFileSync(srcFilePath, '// some ts code');
    fs.writeFileSync(moduleFilePath, '// some js code');
});

afterAll(() => {
    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
});

// Manage CWD for each test to ensure isolation
beforeEach(() => {
    // Set a default CWD for tests
    process.chdir(projectRootDir);
});

afterEach(() => {
    // Restore the original CWD after each test
    process.chdir(originalCwd);
});


// --- Test Suites ---

function privatifyPath(path:string):string {
    return `/private${path}`;
}

describe('getPackageDirectorySync: CWD Mode (`{type: "cwd"}`)', () => {
    it('should find the root package.json when cwd is the project root', () => {
        process.chdir(projectRootDir);
        const result = getPackageDirectorySync({ type: 'cwd' });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.packageJsonPath).toBe(privatifyPath(rootPackageJsonPath));
        }
    });

    it('should find the root package.json when called with no arguments (defaulting to cwd)', () => {
        process.chdir(projectRootDir);
        const result = getPackageDirectorySync(); // Defaults to {type: 'cwd'}

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.packageJsonPath).toBe(privatifyPath(rootPackageJsonPath));
        }
    });

    it('should find the root package.json when cwd is a subdirectory (e.g., /src)', () => {
        process.chdir(srcDir); // Change to a deeper directory
        const result = getPackageDirectorySync({ type: 'cwd' });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.packageJsonPath).toBe(privatifyPath(rootPackageJsonPath));
        }
    });
    
    it('should find the package package.json when cwd is inside a dependency in node_modules', () => {
        process.chdir(myPackageDir); // Running from within a dependency
        const result = getPackageDirectorySync({ type: 'cwd' });

        expect(result.success).toBe(true);
        if (result.success) {
            // It should find the project's package.json, not the module's, because it walks up
            expect(result.packageJsonPath).toBe(privatifyPath(modulePackageJsonPath));
        }
    });

    it('should fail gracefully if no package.json is found in the current path or parents', () => {
        process.chdir(emptyDir); // A directory with no package.json anywhere above it (besides root)
        const result = getPackageDirectorySync({ type: 'cwd' });

        expect(result.success).toBe(false);
        expect(result.packageJsonPath).toBeUndefined();
        if(!result.success){
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toContain('Could not find package.json');
            expect(result.error.message).toContain('Are you running this in the terminal');
        }
    });
});


describe('getPackageDirectorySync: Container Mode (`{type: "container"}`)', () => {
    it("should find the module's package.json when called from a file within a node_modules dependency", () => {
        const moduleFileUrl = pathToFileURL(moduleFilePath).toString();
        const result = getPackageDirectorySync({ type: 'container', esmFileUrl: moduleFileUrl });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.packageJsonPath).toBe(modulePackageJsonPath);
        }
    });
    
    it("should find the root project's package.json when called from a file in the project's src directory", () => {
        const srcFileUrl = pathToFileURL(srcFilePath).toString();
        const result = getPackageDirectorySync({ type: 'container', esmFileUrl: srcFileUrl });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.packageJsonPath).toBe(rootPackageJsonPath);
        }
    });

    it('should fail gracefully if the container file has no associated package.json', () => {
        const orphanFilePath = path.join(emptyDir, 'orphan.js');
        fs.writeFileSync(orphanFilePath, '// I have no home');
        const orphanFileUrl = pathToFileURL(orphanFilePath).toString();

        const result = getPackageDirectorySync({ type: 'container', esmFileUrl: orphanFileUrl });

        expect(result.success).toBe(false);
        expect(result.packageJsonPath).toBeUndefined();
        if(!result.success){
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toContain('Could not find package.json');
            expect(result.error.message).toContain('Are you calling this from a script that is a node project?');
        }
    });
});


describe('getPackageDirectorySync: Error Handling and Edge Cases', () => {
    it('should throw an error when throwError is true and no file is found', () => {
        process.chdir(emptyDir);
        
        expect(() => {
            getPackageDirectorySync({ type: 'cwd' }, true);
        }).toThrow('Could not find package.json');
    });

    it('should NOT throw an error when throwError is true and a file IS found', () => {
        process.chdir(projectRootDir);
        let result: any;

        expect(() => {
             result = getPackageDirectorySync({ type: 'cwd' }, true);
        }).not.toThrow();

        expect(result.success).toBe(true);
        expect(result.packageJsonPath).toBe(privatifyPath(rootPackageJsonPath));
    });

    it('should return a success:false result when an invalid esmFileUrl is provided', () => {
        // An invalid file URL will cause the internal `thisDir` (via `fileURLToPath`) to throw
        const badUrl = 'this-is-not-a-valid-url';
        const result = getPackageDirectorySync({ type: 'container', esmFileUrl: badUrl });

        expect(result.success).toBe(false);
        expect(result.packageJsonPath).toBeUndefined();
        expect(result.error).toBeInstanceOf(Error);
        // This checks for the error thrown by Node's URL parser
        expect(result.error?.message).toContain('Invalid URL');
    });

    it('should gracefully handle non-existent file paths in esmFileUrl', () => {
        const nonExistentFile = path.join(myPackageDir, 'nonexistent.js');
        const nonExistentFileUrl = pathToFileURL(nonExistentFile).toString();

        // This should still work because find-up starts from the directory, which *does* exist
        const result = getPackageDirectorySync({ type: 'container', esmFileUrl: nonExistentFileUrl });
        
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.packageJsonPath).toBe(modulePackageJsonPath);
        }
    });
    
    /**
     * This tests a potential weakness. The function doesn't validate the `type` property.
     * It relies on a downstream error (ReferenceError because `startDirectory` is not set)
     * which is then caught. A more robust implementation might validate inputs explicitly.
     */
    it('should fail gracefully if an invalid `type` is provided in startFrom', () => {
        // @ts-expect-error - Intentionally testing an invalid type
        const result = getPackageDirectorySync({ type: 'some-unknown-type' });

        expect(result.success).toBe(false);
        expect(result.packageJsonPath).toBeUndefined();
        expect(result.error).toBeInstanceOf(Error);
        // Depending on implementation, this could be a ReferenceError or a custom error.
        // We check that it's caught and handled correctly.
        expect(result.error?.message).toBeDefined();
    });
});