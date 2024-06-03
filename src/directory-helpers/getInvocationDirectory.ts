import { cwd } from 'process';
import { stripTrailingSlash } from './stripTrailingSlash';

/**
 * E.g. if invoked as "node ./dist/main.js", this will return "<path to .>"
 * @returns 
 */
export function getInvocationDirectory() {
    return stripTrailingSlash(cwd());
}