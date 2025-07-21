import {getCallingScriptDirectorySync} from '../../src/directory-helpers/getCallingScriptDirectory.js';

export function useGetCallingScriptDirectory() {
    return getCallingScriptDirectorySync();
}