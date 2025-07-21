
import { getCallingScriptDirectory, getCallingScriptDirectorySync } from "./getCallingScriptDirectory.ts";
import { getInvocationDirectory, getInvocationDirectorySync } from "./getInvocationDirectory.ts";
//import { getInvokedScriptDirectory, getInvokedScriptDirectorySync } from "./getInvokedScriptDirectory";
import { getPackageDirectory, getPackageDirectorySync } from "./getPackageDirectory.ts";
import { listSubDirectories } from "./listSubDirectories.ts";
import { stripTrailingSlash } from "./stripTrailingSlash.ts";

export {
    getInvocationDirectory,
    getInvocationDirectorySync,
    getCallingScriptDirectory,
    getCallingScriptDirectorySync,
    //getInvokedScriptDirectory,
    //getInvokedScriptDirectorySync,
    getPackageDirectory,
    getPackageDirectorySync,
    listSubDirectories,
    stripTrailingSlash
}
