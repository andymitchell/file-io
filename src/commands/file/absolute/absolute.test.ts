import { describe, it, expect, beforeEach } from 'vitest';
import { absolute } from './absolute.ts';
import { cwd } from 'process';
import { resolve } from 'path';

// Mock for stripTrailingSlash as its implementation is not provided
const stripTrailingSlash = (path: string) => {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
};

describe('absolute', () => {
  let currentDirectory: string;

  beforeEach(() => {
    currentDirectory = cwd();
  });

  it('should resolve a relative path to an absolute path', () => {
    const relativePath = 'src/index.ts';
    const expectedPath = resolve(currentDirectory, relativePath);
    expect(absolute(relativePath)).toBe(expectedPath);
  });

  it('should return the same path if it is already absolute', () => {
    const absolutePath = '/etc/passwd';
    expect(absolute(absolutePath)).toBe(absolutePath);
  });

  it('should remove a trailing slash from an absolute path', () => {
    const absolutePathWithSlash = '/etc/passwd/';
    const expectedPath = '/etc/passwd';
    expect(absolute(absolutePathWithSlash)).toBe(expectedPath);
  });

  it('should correctly resolve a relative path starting with "./"', () => {
    const relativePath = './src/index.ts';
    const expectedPath = resolve(currentDirectory, relativePath);
    expect(absolute(relativePath)).toBe(expectedPath);
  });

  it('should handle a single filename as a relative path', () => {
    const fileName = 'package.json';
    const expectedPath = resolve(currentDirectory, fileName);
    expect(absolute(fileName)).toBe(expectedPath);
  });

  it('should return the current working directory for an empty string', () => {
    const expectedPath = stripTrailingSlash(currentDirectory);
    expect(absolute('')).toBe(expectedPath);
  });

  it('should handle the root path correctly', () => {
    const rootPath = '/';
    expect(absolute(rootPath)).toBe('');
  });

  it('should handle a relative path with parent directory navigation', () => {
    const relativePath = '../project/src/index.ts';
    const expectedPath = resolve(currentDirectory, relativePath);
    expect(absolute(relativePath)).toBe(expectedPath);
  });
});