import {getCallingScriptDirectorySync} from '../../src/old/directory-helpers/getCallingScriptDirectory.ts';

export function useGetCallingScriptDirectory() {
    return getCallingScriptDirectorySync();
}