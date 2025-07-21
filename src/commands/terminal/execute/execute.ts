import { exec } from "child_process";
import { spawnLikeExec } from "./spawnLikeExec.ts";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";

export async function execute(commandOrPathToFile: string, interactive?: boolean) {
    try {
        return await new Promise((resolve, reject) => {
            (interactive ? spawnLikeExec : exec)(commandOrPathToFile, (error, stdout) => {
                if (error) {
                    reject(new Error(`Code: ${error.code ?? 'na'}. Message: ${error.message}. Stderr: ${error.stderr ?? 'na'}`));
                } else {
                    resolve(stdout);
                }
            });
        });
    } catch (e) {
        throw new Error(`Error executing ${commandOrPathToFile}: ${getErrorMessage(e)}`);
    }
}