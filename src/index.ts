import { backupFileSync } from "./commands/file/backup-file/backupFileSync.ts";
import { copyFileSync } from "./commands/file/copy-file/copyFileSync.ts";
import { getPackageDirectorySync } from "./commands/file/get-package-directory/getPackageDirectorySync.ts";
import { lsSync } from "./commands/file/ls/lsSync.ts";
import { pathInfoSync } from "./commands/file/path-info/pathInfoSync.ts";
import { readJsonFile } from "./commands/file/read-json-file/readJsonFile.ts";
import { relative } from "./commands/file/relative/relative.ts";
import { removeDirectorySync } from "./commands/file/remove-directory/removeDirectorySync.ts";
import { removeFileSync } from "./commands/file/remove-file/removeFileSync.ts";
import { stripTrailingSep } from "./commands/file/strip-trailing-sep/stripTrailingSep.ts";
import { thisDir } from "./commands/file/this-dir/thisDir.ts";
import { writeSync } from "./commands/file/write/writeSync.ts";
import { execute } from "./commands/terminal/execute/execute.ts";
import  { spawnLikeExec } from "./commands/terminal/execute/spawnLikeExec.ts";


export {
    backupFileSync,
    copyFileSync,
    lsSync,
    pathInfoSync,
    readJsonFile,
    relative,
    removeDirectorySync,
    removeFileSync, 
    stripTrailingSep,
    thisDir, 
    writeSync,
    getPackageDirectorySync
}

export {
    execute,
    spawnLikeExec,
}

export * from './commands/terminal/user-input/index.ts';