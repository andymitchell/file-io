import {getCallingScriptDirectorySync} from '../../src/directory-helpers/getCallingScriptDirectory';

export function useGetCallingScriptDirectory() {
    return getCallingScriptDirectorySync();
}