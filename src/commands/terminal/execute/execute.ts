import { exec, type ExecOptions } from "child_process";
import { spawnLikeExec } from "./spawnLikeExec.ts";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";
import type { Options } from "./types.ts";



export async function execute(commandOrPathToFile: string, options?: Options, interactive?: boolean): Promise<string> {
    try {
        return await new Promise((resolve, reject) => {
            if (interactive) {
                spawnLikeExec(commandOrPathToFile, options, (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(`Code: ${error.code ?? 'na'}. Message: ${error.message}. Stderr: ${stderr ?? 'na'}`));
                    } else {
                        resolve(stdout as string);
                    }
                });
            } else {
                const execOptions: ExecOptions = {
                    cwd: options?.cwd
                };
                exec(commandOrPathToFile, execOptions, (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(`Code: ${error.code ?? 'na'}. Message: ${error.message}. Stderr: ${stderr ?? 'na'}`));
                    } else {
                        resolve(stdout);
                    }
                });
            }
        });
    } catch (e) {
        throw new Error(`Error executing ${commandOrPathToFile}: ${getErrorMessage(e)}`);
    }
}