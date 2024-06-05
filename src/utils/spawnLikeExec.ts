import { ExecException, exec, spawn } from "child_process";
type SpawnLikeExecCallback = (error: ExecException | null, stdout: string, stderr: string) => void;

/**
 * Use spawn, for interactive terminal, but is simplified to behave as a drop-in for exec.
 * @param command 
 * @param callback 
 */
export async function spawnLikeExec(command:string, callback: SpawnLikeExecCallback):Promise<void> {
    try {
        const child = spawn(command, {
            stdio: ['inherit', 'pipe', 'pipe'], // Use 'inherit' for stdin and 'pipe' for stdout/stderr
            shell: true,
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            process.stdout.write(data); // Write to the terminal immediately
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
            process.stderr.write(data); // Write to the terminal immediately
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