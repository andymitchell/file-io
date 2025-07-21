import { existsSync, rmSync } from "node:fs";
import { readdirSync } from "node:fs";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";

export function removeDirectory(absolutePathToDirectory: string, force?: boolean): { success: true, error?: undefined } | { success: false, error: Error } {
    try {
        if (!existsSync(absolutePathToDirectory)) {
            return { success: true };
        }

        const dirContents = readdirSync(absolutePathToDirectory);
        if (dirContents.length > 0 && !force) {
            return {
                success: false,
                error: new Error(`Directory ${absolutePathToDirectory} is not empty. Skipping deletion.`, { cause: { reason: 'directory_not_empty' } })
            };
        }

        rmSync(absolutePathToDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
        return { success: true };
    } catch (e) {
        return { success: false, error: new Error(`Cannot remove directory ${absolutePathToDirectory}. Error: ${getErrorMessage(e)}`) };
    }
}