import { IFileIoSync } from "./types";
import {  readFileSync, writeFileSync, appendFileSync, copyFileSync, readdirSync, mkdirSync, rmdirSync, rmSync, statSync, chmodSync } from 'fs';

import { stripTrailingSlash } from "./directory-helpers/stripTrailingSlash";
import { execSync } from 'child_process';
import {dirname} from 'path';
import { getErrorMessage } from "./utils/getErrorMessage";


export const fileIoSyncNode:IFileIoSync = {
    read(absolutePath) {
        try {
            const content = readFileSync(absolutePath, 'utf-8');
            return content;
        } catch(e) {
            throw new Error(`Cannot read file ${absolutePath}. Error: ${getErrorMessage(e)}`);
        }
    },
    write(absolutePath, content, append, appendingSeparatorOnlyIfFileExists?: string) {
        try {
            if (append) {
                const hasFile = fileIoSyncNode.has_file(absolutePath);
                if (hasFile && appendingSeparatorOnlyIfFileExists) content = `${appendingSeparatorOnlyIfFileExists}${content}`;
                appendFileSync(absolutePath, content);
            } else {
                writeFileSync(absolutePath, content);
            }
        } catch(e) {
            throw new Error(`Cannot write file ${absolutePath}. Error: ${getErrorMessage(e)}`);
        }
    },
    copy_file(source, destination) {
        try {
            copyFileSync(source, destination);
        } catch(e) {
            throw new Error(`Cannot copy file ${source} to ${destination}. Error: ${getErrorMessage(e)}`);
        }
    },
    list_files(absolutePathDirectory, options?) {
        try {
            let files = readdirSync(absolutePathDirectory, { recursive: options?.recurse, withFileTypes: true });

            return files
                .filter(x => {
                    return x.isFile() && (!options?.file_pattern || options?.file_pattern.test(x.name));
                })
                .map(x => {
                    const path = stripTrailingSlash(x.parentPath ?? x.path);
                    return {
                        file: x.name,
                        path,
                        uri: `${path}/${x.name}`
                    };
                });
        } catch(e) {
            throw new Error(`Cannot list files ${absolutePathDirectory}. Error: ${getErrorMessage(e)}`);
        }
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
    execute_file(absolutePathToFile) {
        try {
            return execSync(absolutePathToFile).toString();
        } catch (e) {
            throw new Error(`Cannot execute file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
        }
    },
    directory_name(absolutePathToFileOrDirectory) {
        return dirname(absolutePathToFileOrDirectory);
    },
};

