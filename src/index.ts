import { backupFileSync } from "./commands/file/backup-file/backupFileSync.ts";
import { copyFileSync } from "./commands/file/copy-file/copyFileSync.ts";
import { lsSync } from "./commands/file/ls/lsSync.ts";
import { pathInfoSync } from "./commands/file/path-info/pathInfoSync.ts";
import { readJsonFile } from "./commands/file/read-json-file/readJsonFile.ts";
import { relative } from "./commands/file/relative/relative.ts";
import { removeDirectory } from "./commands/file/remove-directory/removeDirectory.ts";
import { removeFile } from "./commands/file/remove-file/removeFile.ts";
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
    removeDirectory,
    removeFile, 
    stripTrailingSep,
    thisDir, 
    writeSync
}

export {
    execute,
    spawnLikeExec,
}

export * from './commands/terminal/user-input/index.ts';