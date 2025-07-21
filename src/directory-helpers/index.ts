
import { getCallingScriptDirectory, getCallingScriptDirectorySync } from "./getCallingScriptDirectory.js";
import { getInvocationDirectory, getInvocationDirectorySync } from "./getInvocationDirectory.js";
//import { getInvokedScriptDirectory, getInvokedScriptDirectorySync } from "./getInvokedScriptDirectory";
import { getPackageDirectory, getPackageDirectorySync } from "./getPackageDirectory.js";
import { listSubDirectories } from "./listSubDirectories.js";
import { stripTrailingSlash } from "./stripTrailingSlash.js";

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
