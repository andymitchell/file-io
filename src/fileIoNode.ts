import { IFileIo } from "./types";
import { promises as fs } from 'fs';
import { stripTrailingSlash } from "./directory-helpers/stripTrailingSlash";
import { exec } from 'child_process';
import  {dirname, relative} from 'path';
import { getErrorMessage, isFileErrorNotExists } from "./utils/getErrorMessage";
import { spawnLikeExec } from "./utils/spawnLikeExec";

async function makeDirectoryIfNotExists(pathOrFile:string):Promise<void> {
    const destinationDirectory = await fileIoNode.directory_name(pathOrFile);
    const hasDestinationDirectory = await fileIoNode.has_directory(destinationDirectory);
    if( !hasDestinationDirectory ) {
        await fileIoNode.make_directory(destinationDirectory)
    }
}

export const fileIoNode:IFileIo = {
    async read(absolutePath) {
        try {
            const content = await fs.readFile(absolutePath, 'utf-8');
            return content;
        } catch(e) {
            if( isFileErrorNotExists(e) ) return undefined;
            throw new Error(`Cannot read file ${absolutePath}. Error: ${getErrorMessage(e)}`);
        }
    },
    async write(absolutePath, content, options?) {
        try {
            

            const hasFile = await fileIoNode.has_file(absolutePath);
            if (options?.append) {
                
                if( hasFile && options?.appending_separator_only_if_file_exists ) content = `${options?.appending_separator_only_if_file_exists}${content}`
                await fs.appendFile(absolutePath, content);
            } else {
                if( !options?.overwrite && hasFile ) throw new Error('Cannot overwrite');
                if( !hasFile && options?.make_directory ) makeDirectoryIfNotExists(absolutePath);
                await fs.writeFile(absolutePath, content);
            }
        } catch(e) {
            throw new Error(`Cannot write file ${absolutePath}. Error: ${getErrorMessage(e)}`);
        }
    },
    async copy_file(source, destination, options) {
        try {
            const hasFile = await fileIoNode.has_file(destination);
            if( !options?.overwrite && hasFile ) throw new Error('Cannot overwrite');

            if( options?.make_directory ) await makeDirectoryIfNotExists(destination);

            await fs.copyFile(source, destination);
        } catch(e) {
            throw new Error(`Cannot copy file ${source} to ${destination}. Error: ${getErrorMessage(e)}`);
        }
    },
    async list_files(absolutePathDirectory, options?) {
        try {
            let files = await fs.readdir(absolutePathDirectory, {'recursive': options?.recurse, 'withFileTypes': true});

            return files
                .filter(x => {
                    return x.isFile() && (!options?.file_pattern || options?.file_pattern.test(x.name))
                })
                .map(x => {
                    const path = stripTrailingSlash(x.parentPath ?? x.path);
                    return {
                        file: x.name, 
                        path,
                        uri: `${path}/${x.name}`
                    }
                });
        } catch(e) {
            throw new Error(`Cannot list files ${absolutePathDirectory}. Error: ${getErrorMessage(e)}`);
        }
    },
    async make_directory(absolutePathToDirectory) {
        try {
            await fs.mkdir(absolutePathToDirectory, {recursive: true});
        } catch(e) {
            throw new Error(`Cannot make directory ${absolutePathToDirectory}. Error: ${getErrorMessage(e)}`);
        }
    },
    async remove_directory(absolutePathToDirectory, force) {
        try {
            if( !(await fileIoNode.has_directory(absolutePathToDirectory)) ) {
                debugger;
                return;
            }

            const files = await fs.readdir(absolutePathToDirectory, {'recursive': true});
            if (files.length > 0 && !force) {
                console.log(`Directory ${absolutePathToDirectory} is not empty. Skipping deletion.`);
                debugger;
                return;
            }

            if( force ) {
                await fs.rm(absolutePathToDirectory, {recursive: true, force: true});
            } else {
                await fs.rmdir(absolutePathToDirectory);
            }
        } catch(e) {
            throw new Error(`Cannot remove directory ${absolutePathToDirectory}. Error: ${getErrorMessage(e)}`);
        }
    },
    async remove_file(absolutePathToFile) {
        try {
            if( !await fileIoNode.has_file(absolutePathToFile) ) return;
            await fs.rm(absolutePathToFile);    
        } catch(e) {
            throw new Error(`Cannot remove file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
        }
    },
    async has_directory(absolutePathDirectory) {
        try {
            const stat = await fs.stat(absolutePathDirectory);
            return stat.isDirectory();
        } catch (error) {
            // If an error occurs, it means the path does not exist or is not accessible
            return false;
        }
    },
    async has_file(absolutePathToFile) {
        try {
            const stat = await fs.stat(absolutePathToFile);
            return stat.isFile();
        } catch (error) {
            // If an error occurs, it means the path does not exist or is not accessible
            return false;
        }
    },
    async chmod_file(absolutePathToFile, permissions:string) {
        try {
            if( permissions==='+x' ) permissions = '755'; // convenience
            await fs.chmod(absolutePathToFile, permissions);
        } catch (e) {
            throw new Error(`Cannot chmod file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
        }
    },
    async execute(commandOrPathToFile, interactive?: boolean) {
        try {
            return await new Promise((resolve, reject) => {
                (interactive? spawnLikeExec : exec)(commandOrPathToFile, (error, stdout) => {
                    if( error ) {
                        reject(new Error(`Code: ${error.code ?? 'na'}. Message: ${error.message}. Stderr: ${error.stderr ?? 'na'}`));
                    } else {
                        resolve(stdout);
                    }
                });
            });
        } catch (e) {
            throw new Error(`Error executing ${commandOrPathToFile}: ${getErrorMessage(e)}`);
        }
    },
    async directory_name(absolutePathToFileOrDirectory) {
        return dirname(absolutePathToFileOrDirectory);
    },
    async relative(fromAbsolutePathDirectoryOrFile, toAbsolutePathDirectoryOrFile, prefixCurrentDirectoryIndicator = true) {
        return `${prefixCurrentDirectoryIndicator? './' : ''}${relative(fromAbsolutePathDirectoryOrFile, toAbsolutePathDirectoryOrFile)}`;
    },
};

