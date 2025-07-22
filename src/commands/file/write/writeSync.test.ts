import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { writeSync } from "./writeSync.ts";
import { rmSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const TEST_DIR = join(tmpdir(), "vitest-test-writesync");

beforeAll(() => {
    // Create a temporary directory for our tests. [1]
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
    // Cleanup the temporary directory. [1]
    rmSync(TEST_DIR, { recursive: true, force: true });
});

beforeEach(() => {
    // Ensure the directory is clean before each test. [5]
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
});

describe("writeSync", () => {
    it("should create a new file with the given content", () => {
        const filePath = join(TEST_DIR, "test.txt");
        const content = "Hello, world!";
        const result = writeSync(filePath, content);

        expect(result.success).toBe(true);
        expect(existsSync(filePath)).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe(content);
    });

    it("should append content to an existing file", () => {
        const filePath = join(TEST_DIR, "test.txt");
        const initialContent = "Initial content.";
        const appendedContent = " Appended content.";
        writeSync(filePath, initialContent);
        const result = writeSync(filePath, appendedContent, { append: true });

        expect(result.success).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe(
            initialContent + appendedContent
        );
    });

    it("should append content with a separator if the file exists", () => {
        const filePath = join(TEST_DIR, "test.txt");
        const initialContent = "Initial content";
        const appendedContent = "Appended content";
        const separator = "\n";
        writeSync(filePath, initialContent);
        const result = writeSync(filePath, appendedContent, {
            append: true,
            appending_separator_only_if_file_exists: separator,
        });

        expect(result.success).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe(
            `${initialContent}${separator}${appendedContent}`
        );
    });

    it("should not add a separator when appending to a new file", () => {
        const filePath = join(TEST_DIR, "new_test.txt");
        const content = "New file content";
        const separator = "\n";
        const result = writeSync(filePath, content, {
            append: true,
            appending_separator_only_if_file_exists: separator,
        });

        expect(result.success).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe(content);
    });

    it("should return an error when trying to overwrite a file without the overwrite option", () => {
        const filePath = join(TEST_DIR, "test.txt");
        const initialContent = "Initial content.";
        writeSync(filePath, initialContent);
        const result = writeSync(filePath, "New content");

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toContain("Cannot overwrite");
    });

    it("should overwrite an existing file when the overwrite option is true", () => {
        const filePath = join(TEST_DIR, "test.txt");
        const initialContent = "Initial content.";
        const newContent = "Overwritten content.";
        writeSync(filePath, initialContent);
        const result = writeSync(filePath, newContent, { overwrite: true });

        expect(result.success).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe(newContent);
    });

    it("should create a directory if it does not exist when the make_directory option is true", () => {
        const newDirPath = join(TEST_DIR, "new-dir");
        const filePath = join(newDirPath, "test.txt");
        const content = "Hello from a new directory!";
        const result = writeSync(filePath, content, { make_directory: true });

        expect(result.success).toBe(true);
        expect(existsSync(filePath)).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe(content);
    });

    it("should return an error if writing to a non-existent directory without the make_directory option", () => {
        const newDirPath = join(TEST_DIR, "non-existent-dir");
        const filePath = join(newDirPath, "test.txt");
        const content = "This should fail";
        const result = writeSync(filePath, content);

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toContain("ENOENT");
    });

    it("should return a success: false object with an error on failure", () => {
        // Attempt to write to a read-only directory (simulated by a file)
        const filePath = join(TEST_DIR, "a_file");
        writeSync(filePath, "I am a file, not a directory");
        const nestedFilePath = join(filePath, "test.txt");
        const result = writeSync(nestedFilePath, "This should fail", {
            make_directory: true,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toContain("ENOTDIR");
    });

    it('should fail if try to write to a directory', () => {
        const result = writeSync(TEST_DIR, 'my file');
        expect(result.error?.message).toContain('Pointed to a directory');
    })

    it('should throw an error', () => {
        expect(() => writeSync(TEST_DIR, 'my file', undefined, true)).toThrow('Pointed to a directory');
    })

});