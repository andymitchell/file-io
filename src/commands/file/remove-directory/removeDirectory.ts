import { existsSync, rmSync } from "node:fs";
import { readdirSync } from "node:fs";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";

/**
 * Recursively removes a directory at the given absolute path.
 * 
 * By default, this function will **not** delete the directory if it contains anything.
 *
 * - If the directory does not exist, this is treated as a successful no-op.
 * - If the directory is not empty and `force` is not `true`, deletion is skipped and an error is returned.
 * - Otherwise, attempts to delete the directory and all its contents, retrying up to 3 times on failure.
 * - If the directory contains symlinks, and `force` is `true`, the link will be deleted but the linked directory remains 
 *
 * @param absolutePathToDirectory - The absolute filesystem path of the directory to remove.
 * @param force - If `true`, deletes non-empty directories; otherwise, skips deletion on non-empty directories.
 * @returns An object with:
 *   - `success: true` if the directory was removed (or did not exist),
 *   - `success: false` and an `Error` if deletion was skipped or failed.
 *
 * @example
 * // Directory does not exist → success
 * const result1 = removeDirectory("/tmp/nonexistent");
 * // result1 === { success: true }
 *
 * @example
 * // Directory exists but is not empty, without force → error
 * // (error.cause.reason === 'directory_not_empty')
 * const result2 = removeDirectory("/tmp/my-data");
 * // result2 === { success: false, error: Error("Directory /tmp/my-data is not empty. Skipping deletion.") }
 *
 * @example
 * // Directory exists and force deletion of contents
 * const result3 = removeDirectory("/tmp/my-data", true);
 * // result3 === { success: true }
 *
 * @example
 * // Unexpected failure (e.g., permissions) → error with underlying message
 * const result4 = removeDirectory("/root/protected", true);
 * // result4 === { success: false, error: Error("Cannot remove directory /root/protected. Error: <details>") }
 */
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