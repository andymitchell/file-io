import { cwd } from 'process';
import { stripTrailingSlash } from './stripTrailingSlash.ts';

/**
 * E.g. if invoked as "node ./dist/main.js", this will return "<path to .>"
 * @returns 
 */
export function getInvocationDirectorySync() {
    return stripTrailingSlash(cwd());
}

export async function getInvocationDirectory() {
    return getInvocationDirectorySync();
}