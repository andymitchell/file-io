import { exec, type ExecOptions } from "child_process";
import { spawnLikeExec } from "./spawnLikeExec.ts";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";
import type { Options } from "./types.ts";



/**
 * Run a shell command or script, and get the result as a string (of stdout)
 * 
 * Under the hood:
 * - Non‑interactive: uses `child_process.exec`
 * - Interactive: uses `spawn` (via `spawnLikeExec`) so you get real‑time stdin/stdout
 * 
 * @param commandOrPathToFile The shell command or script to run (e.g. `node script.js`).
 * @param options Optional options for the execution
 * @param options.cwd Change the current working directory context that the script/command uses 
 * @param interactive Optional. If `true`, runs via `spawn` to allow user interaction, until the uses closes it. 
 * @returns Resolves to stdout (as string), or rejects with an error containing exit code and stderr.
 * 
 * @example
 * const out = await execute('echo hello');
 * // → 'hello\n'
 * 
 * @example
 * const out = await execute('node my-script.js', { cwd: '/tmp/project' });
 * 
 * @example
 * await execute('npm login', undefined, true); // allows interactive prompts
 */ 
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