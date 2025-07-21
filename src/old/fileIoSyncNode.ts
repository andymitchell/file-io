import type { IFileIoSync } from "./types.js";
import {  readFileSync, writeFileSync, appendFileSync, copyFileSync, readdirSync, mkdirSync, rmdirSync, rmSync, statSync, chmodSync } from 'fs';

import { stripTrailingSlash } from "./directory-helpers/stripTrailingSlash.js";
import { execSync, type ExecSyncOptionsWithStringEncoding } from 'child_process';
import * as path from 'path';
import {dirname, relative} from 'path';
import { getErrorMessage, isFileErrorNotExists } from "./utils/getErrorMessage.js";
import { listDirFiles } from "./file-helpers/list-files/listDirFiles.ts";

function makeDirectoryIfNotExists(pathOrFile:string):void {
    const destinationDirectory = fileIoSyncNode.directory_name(pathOrFile);
    const hasDestinationDirectory = fileIoSyncNode.has_directory(destinationDirectory);
    if( !hasDestinationDirectory ) {
        fileIoSyncNode.make_directory(destinationDirectory)
    }
}

export const fileIoSyncNode:IFileIoSync = {
    read(absolutePath) {
        try {
            const content = readFileSync(absolutePath, 'utf-8');
            return content;
        } catch(e) {
            if( isFileErrorNotExists(e) ) return undefined;
            
            throw new Error(`Cannot read file ${absolutePath}. Error: ${getErrorMessage(e)}`);
        }
    },
    write(absolutePath, content, options?) {
        try {
            
            const hasFile = fileIoSyncNode.has_file(absolutePath);
            if (options?.append) {
                if (hasFile && options?.appending_separator_only_if_file_exists) content = `${options?.appending_separator_only_if_file_exists}${content}`;
                appendFileSync(absolutePath, content);
            } else {
                if( !options?.overwrite && hasFile ) throw new Error('Cannot overwrite');
                if( !hasFile && options?.make_directory ) makeDirectoryIfNotExists(absolutePath);
                writeFileSync(absolutePath, content);
            }
        } catch(e) {
            throw new Error(`Cannot write file ${absolutePath}. Error: ${getErrorMessage(e)}`);
        }
    },
    copy_file(source, destination, options) {
        try {
            const hasFile = fileIoSyncNode.has_file(destination);
            if( !options?.overwrite && hasFile ) throw new Error('Cannot overwrite');

            if( options?.make_directory ) makeDirectoryIfNotExists(destination);

            copyFileSync(source, destination);
        } catch(e) {
            throw new Error(`Cannot copy file ${source} to ${destination}. Error: ${getErrorMessage(e)}`);
        }
    },
    list_files(absolutePathDirectory, options?) {
        return listDirFiles(absolutePathDirectory, options);
    },
    make_directory(absolutePathToDirectory) {
        try {
            mkdirSync(absolutePathToDirectory, { recursive: true });
        } catch(e) {
            throw new Error(`Cannot make directory ${absolutePathToDirectory}. Error: ${getErrorMessage(e)}`);
        }
    },
    remove_directory(absolutePathToDirectory, force) {
        try {
            if (!fileIoSyncNode.has_directory(absolutePathToDirectory)) return;

            const files = readdirSync(absolutePathToDirectory);
            if (files.length > 0 && !force) {
                console.log(`Directory ${absolutePathToDirectory} is not empty. Skipping deletion.`);
                return;
            }

            if (force) {
                rmSync(absolutePathToDirectory, { recursive: true, force: true });
            } else {
                rmdirSync(absolutePathToDirectory);
            }
        } catch(e) {
            throw new Error(`Cannot remove directory ${absolutePathToDirectory}. Error: ${getErrorMessage(e)}`);
        }
    },
    remove_file(absolutePathToFile) {
        try {
            if (!fileIoSyncNode.has_file(absolutePathToFile)) return;
            rmSync(absolutePathToFile);
        } catch(e) {
            throw new Error(`Cannot remove file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
        }
    },
    has_directory(absolutePathDirectory) {
        try {
            
            const stat = statSync(absolutePathDirectory);
            return stat.isDirectory();
        } catch (error) {
            // If an error occurs, it means the path does not exist or is not accessible
            return false;
        }
    },
    has_file(absolutePathToFile) {
        try {
            const stat = statSync(absolutePathToFile);
            return stat.isFile();
        } catch (error) {
            // If an error occurs, it means the path does not exist or is not accessible
            return false;
        }
    },
    chmod_file(absolutePathToFile, permissions: string) {
        try {
            if (permissions === '+x') permissions = '755'; // convenience
            chmodSync(absolutePathToFile, permissions);
        } catch (e) {
            throw new Error(`Cannot chmod file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
        }
    },
    execute(commandOrPathToFile, interactive?: boolean, options?: ExecSyncOptionsWithStringEncoding) {
        try {
            if( interactive ) throw new Error("Interactive mode not supported in sync");
            return execSync(commandOrPathToFile, options).toString();
        } catch (e) {
            throw new Error(`Cannot execute file ${commandOrPathToFile}. Error: ${getErrorMessage(e)}`);
        }
    },
    file_info(absolutePathToFile) {
        let directory = stripTrailingSlash(path.dirname(absolutePathToFile));
        if( directory==='.' ) directory = '';
        const file = path.basename(absolutePathToFile); // (basename with extension)
        const base_name = path.basename(absolutePathToFile, path.extname(absolutePathToFile)); // (filename without extension)
        const dot_extension = path.extname(absolutePathToFile);
        
        
        return {
            base_name,
            extension: dot_extension.replace(/^\./, ''),
            dot_extension,
            file,
            directory: directory,
            uri: `${directory? `${directory}/` : ''}${file}`
        };
    },
    directory_name(absolutePathToFileOrDirectory) {
        return dirname(absolutePathToFileOrDirectory);
    },
    relative(fromAbsolutePathDirectoryOrFile, toAbsolutePathDirectoryOrFile) {
        const relPath = relative(fromAbsolutePathDirectoryOrFile, toAbsolutePathDirectoryOrFile);
        return `${relPath.indexOf('../')!==0? './' : ''}${relPath}`;
    },
};

