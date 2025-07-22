import { type ExecException, spawn, type SpawnOptions } from "child_process";

import type { Options } from "./types.ts";

type SpawnLikeExecCallback = (error: ExecException | null, stdout: string, stderr: string) => void;

/**
 * Use spawn, for interactive terminal, but is simplified to behave as a drop-in for exec.
 * @param command
 * @param options
 * @param callback
 */
export function spawnLikeExec(command:string, options: Options | undefined, callback: SpawnLikeExecCallback): void {
    try {

        // Determine the correct stdio configuration.
        // - In a test environment (like Vitest), ignore stdin to prevent hanging.
        // - Otherwise, inherit stdin for true user interactivity.
        const stdioConfig: SpawnOptions['stdio'] = process.env.VITEST || process.env.TEST
            ? ['ignore', 'pipe', 'pipe']
            : ['inherit', 'pipe', 'pipe'];

        const spawnOptions: SpawnOptions = {
            stdio: stdioConfig,
            shell: true,
            cwd: options?.cwd,
            env: process.env,
        };


        const child = spawn(command, spawnOptions);

        let stdout = '';
        let stderr = '';

        child.stdout!.on('data', (data) => {
            stdout += data.toString();
            process.stdout.write(data);
        });

        child.stderr!.on('data', (data) => {
            stderr += data.toString();
            process.stderr.write(data);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                const error: ExecException = new Error(`Command failed with exit code ${code}`) as ExecException;
                error.code = code ?? undefined;
                callback(error, stdout, stderr);
            } else {
                callback(null, stdout, stderr);
            }
        });

        child.on('error', (error) => {
            const execError: ExecException = error as ExecException;
            callback(execError, stdout, stderr);
        });

    } catch (error) {
        const execError: ExecException = error as ExecException;
        callback(execError, '', '');
    }
}