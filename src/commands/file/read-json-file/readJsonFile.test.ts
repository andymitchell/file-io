// readJsonFile.test.ts

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { readJsonFile } from './readJsonFile.ts';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

describe('readJsonFile', () => {
    let tempDir: string;

    // Test file paths
    let validJsonPath: string;
    let invalidJsonPath: string;
    let jsonWithCommentsPath: string;
    let emptyJsonPath: string;

    // Test data
    const validJsonContent = '{"key": "value", "number": 42}';
    const invalidJsonContent = '{"key": "value",';
    const jsonWithCommentsContent = `
    {
        // This is a comment
        "key": "value"
    }
    `;
    const defaultObject = { "default": "object" };

    beforeAll(() => {
        // Create a temporary directory for our test files. [6, 7]
        tempDir = mkdtempSync(resolve(tmpdir(), 'readJsonFile-test-'));

        // Define paths for our temporary test files
        validJsonPath = resolve(tempDir, 'valid.json');
        invalidJsonPath = resolve(tempDir, 'invalid.json');
        jsonWithCommentsPath = resolve(tempDir, 'with-comments.jsonc');
        emptyJsonPath = resolve(tempDir, 'empty.json');

        // Write content to the temporary files
        writeFileSync(validJsonPath, validJsonContent);
        writeFileSync(invalidJsonPath, invalidJsonContent);
        writeFileSync(jsonWithCommentsPath, jsonWithCommentsContent);
        writeFileSync(emptyJsonPath, '');
    });

    afterAll(() => {
        // Clean up the temporary directory after all tests have run
        rmSync(tempDir, { recursive: true, force: true });
    });

    // Test Suite: Successful File Reads
    describe('Successful Reads', () => {
        test('should read a valid JSON file correctly', () => {
            const result = readJsonFile(validJsonPath);
            expect(result.object).toEqual({ key: 'value', number: 42 });
            expect(result.file_found).toBe(true);
            expect(result.error).toBeUndefined();
        });

        test('should read a JSON file with comments (JSON5) by default', () => {
            const result = readJsonFile(jsonWithCommentsPath);
            expect(result.object).toEqual({ key: 'value' });
            expect(result.file_found).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    // Test Suite: File and Path Errors
    describe('File and Path Errors', () => {
        test('should return an error and no object if file URI is undefined', () => {
            const result = readJsonFile(undefined);
            expect(result.object).toBeUndefined();
            expect(result.file_found).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('No file uri');
        });

        test('should return an error and no object for a non-existent file', () => {
            const nonExistentPath = resolve(tempDir, 'non-existent.json');
            const result = readJsonFile(nonExistentPath);
            expect(result.object).toBeUndefined();
            expect(result.file_found).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('Bad file uri');
        });
    });

    // Test Suite: JSON Parsing Errors
    describe('JSON Parsing Errors', () => {
        test('should return an error for an invalid JSON file', () => {
            const result = readJsonFile(invalidJsonPath);
            expect(result.object).toBeUndefined();
            expect(result.file_found).toBe(true);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('Could not parse JSON');
        });

        test('should return an error for an empty file', () => {
            const result = readJsonFile(emptyJsonPath);
            expect(result.object).toBeUndefined();
            expect(result.file_found).toBe(true);
            expect(result.error).toBeInstanceOf(Error);
        });

        test('should fail to read a JSON file with comments when vanilla_json is true', () => {
            const result = readJsonFile(jsonWithCommentsPath, undefined, { vanilla_json: true });
            expect(result.object).toBeUndefined();
            expect(result.file_found).toBe(true);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('Could not parse JSON');
        });
    });

    // Test Suite: Default Object Handling
    describe('Default Object Handling', () => {
        test('should return default object if file URI is undefined', () => {
            const result = readJsonFile(undefined, defaultObject);
            expect(result.object).toEqual(defaultObject);
            expect(result.file_found).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
        });

        test('should return default object for a non-existent file', () => {
            const nonExistentPath = resolve(tempDir, 'non-existent-with-default.json');
            const result = readJsonFile(nonExistentPath, defaultObject);
            expect(result.object).toEqual(defaultObject);
            expect(result.file_found).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
        });

        test('should return default object for an invalid JSON file', () => {
            const result = readJsonFile(invalidJsonPath, defaultObject);
            expect(result.object).toEqual(defaultObject);
            expect(result.file_found).toBe(true);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error?.message).toContain('Could not parse JSON');
        });
    });

    // Test Suite: Options Handling
    describe('Options Handling', () => {
        test('should successfully read a valid JSON file with vanilla_json option', () => {
            const result = readJsonFile(validJsonPath, undefined, { vanilla_json: true });
            expect(result.object).toEqual({ key: 'value', number: 42 });
            expect(result.file_found).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });
});