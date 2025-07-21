import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, isAbsolute } from 'node:path';
import { listDirFiles } from './listDirFiles.ts';
import type { ListedFile } from './types.ts';

// Helper to sort results for stable comparison
const sortResults = (arr: ListedFile[]) => arr.sort((a, b) => a.uri.localeCompare(b.uri));


describe('listDirFiles', () => {
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
            const result = listDirFiles(tempDir, { file_pattern: 'file1.ts' });

            expect(result).toHaveLength(1);
            const file = result[0]!;

            expect(file.basename).toBe('file1.ts');
            expect(file.dirname).toBe(resolve(tempDir));
            expect(file.uri).toBe(resolve(tempDir, 'file1.ts'));
            expect(isAbsolute(file.uri)).toBe(true);
            expect(isAbsolute(file.dirname)).toBe(true);
        });
    });

    describe('Recurse option', () => {
        it('should NOT find files in subdirectories by default', () => {
            const results = listDirFiles(tempDir);
            const fileNames = results.map(f => f.basename);

            expect(fileNames).toContain('file1.ts');
            expect(fileNames).not.toContain('main.ts');
        });

        it('should find files in subdirectories when recurse is true', () => {
            const results = listDirFiles(tempDir, { recurse: true });
            const fileNames = results.map(f => f.basename);
            
            expect(fileNames).toContain('file1.ts');
            expect(fileNames).toContain('main.ts');
            expect(fileNames).toContain('data.json');
        });
    });

    describe('file_pattern option', () => {
        it('should return identical results for equivalent string and RegExp patterns', () => {
            const globPattern = '**/*.ts'; // double-star to match recurse: true
            const regExpPattern = /\.ts$/;

            const fromGlob = listDirFiles(tempDir, { file_pattern: globPattern, recurse: true });
            const fromRegExp = listDirFiles(tempDir, { file_pattern: regExpPattern, recurse: true });

            // Sort to ensure order doesn't affect comparison
            expect(sortResults(fromGlob)).toEqual(sortResults(fromRegExp));
            expect(fromGlob.length).toBeGreaterThan(1); // Sanity check
        });

         it('should correctly filter with a RegExp pattern', () => {
            const results = listDirFiles(tempDir, { 
                file_pattern: /file\d\.(ts|js)/, 
                recurse: true 
            });

            expect(sortResults(results).map(r => r.basename)).toEqual(['file1.ts', 'file2.js']);
        });
    });

    describe('Symbolic links', () => {
        it('should NOT follow symlinks by default', () => {
            const results = listDirFiles(tempDir, { recurse: true });
            const found = results.some(file => file.basename === 'linked-file.ts');

            expect(found).toBe(false);
        });

        it('should follow symlinks when follow: true is set', () => {
            const results = listDirFiles(tempDir, { recurse: true, follow: true });
            const found = results.some(file => file.basename === 'linked-file.ts');

            expect(found).toBe(true);
        });
    });

    describe('Ignore option', () => {
        it('should ignore files and directories specified in the ignore array', () => {
            const results = listDirFiles(tempDir, { 
                recurse: true, 
                ignore: ['**/.git/**'] 
            });
            const foundGitConfig = results.some(file => file.uri.includes('.git'));
            
            expect(foundGitConfig).toBe(false);

            // Sanity check: ensure other files are still found
            const foundMainTs = results.some(file => file.basename === 'main.ts');
            expect(foundMainTs).toBe(true);
        });
    });

    describe('globOptions override', () => {
        it('should prioritize globOptions over all other simplified options', () => {
            // Set simple options that contradict globOptions
            const simpleOptions = {
                recurse: true,
                follow: false,  // globOptions will set follow: true
            };
            
            // Override with specific glob settings
            const globOptions = {
                follow: true, 
            };

            const results = listDirFiles(tempDir, { ...simpleOptions, globOptions });
            
            // Test if follow was overridden: 'linked-file.ts' should be found
            const foundLinkedFile = results.some(r => r.basename === 'linked-file.ts');
            expect(foundLinkedFile, "globOptions 'follow: true' should override 'follow: false'").toBe(true);

        });
    });
});