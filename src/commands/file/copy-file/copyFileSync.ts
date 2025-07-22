import { copyFileSync as nodeCopyFileSync, existsSync, mkdirSync } from "node:fs";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";
import { pathInfoSync } from "../path-info/pathInfoSync.ts";
import { basename, dirname, join, resolve, sep } from "node:path";


type Options = {
    overwrite?: boolean
}

type Response = {success: true, absoluteDestinationFile: string, error?: undefined} | {success: false, absoluteDestinationFile?: undefined, error: Error}

/**
 * Copies a file to a destination path, which may be a directory or a specific file 
 *
 * - Automatically creates the destination directory if it doesn't exist.
 * - Optionally overwrites an existing file.
 * 
 * @param source
 *   The path to the file you want to copy. Must refer to an existing file.
 *
 * @param destination
 *   The target  Can be:
 *     - A directory (ending in a path separator or existing as a directory) — the file
 *       will be copied into that directory, preserving its original basename.
 *     - A file path — the file will be copied to exactly this 
 *
 * @param options
 * @param options.overwrite If `true`, allows overwriting an existing file at the destination. Defaults to `false`.
 *
 * @returns
 * - `{ success: true, absoluteDestinationFile }` if the file was copied successfully.
 * - `{ success: false, error }` if the operation failed (e.g. source doesn't exist, or overwrite was disallowed).
 *
 *
 * @example
 * // Copy "foo.txt" into the "backup/" directory (creates "backup/foo.txt").
 * const result = copyFileSync("foo.txt", "backup/");
 * if (result.success) {
 *   console.log("Copied to:", result.absoluteDestinationFile);
 * } else {
 *   console.error("Copy failed:", result.error.message);
 * }
 *
 * @example
 * // Copy and rename in one step, creating intermediate directories if needed:
 * const renamed = copyFileSync("docs/report.pdf", "archives/2025/report-final.pdf");
 * if (!renamed.success) {
 *   throw renamed.error;
 * }
 *
 * @example
 * // Overwrite an existing file
 * const overwritten = copyFileSync("data.csv", "output/data.csv", { overwrite: true });
 * if (!overwritten.success) {
 *   console.error("Could not overwrite:", overwritten.error.message);
 * }
 * 
 */
export function copyFileSync(source: string, destination: string, options?: Options, throwError?:boolean):Response {
    const response = _copyFileSync(source, destination, options);
    if( response.success===false && throwError ) {
        throw response.error;
    }
    return response;
}
function _copyFileSync(source: string, destination: string, options?: Options):Response {
    try {
        if (!existsSync(source)) {
            return { success: false, error: new Error(`Source file does not exist: ${source}`) };
        }

        let isDestDirectory = false;
        if (existsSync(destination)) {
            const info = pathInfoSync(destination, true);
            isDestDirectory = info.type==='dir';
        } else if (destination.endsWith(sep) || destination.endsWith('/')) {
            isDestDirectory = true;
        }

        const finalDestination = isDestDirectory
            ? join(destination, basename(source))
            : destination;

        if (existsSync(finalDestination) && !options?.overwrite) {
            return { success: false, error: new Error(`Destination file already exists and overwrite is not enabled: ${finalDestination}`) };
        }

        const destDir = dirname(finalDestination);
        if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
        }

        nodeCopyFileSync(source, finalDestination);

        return {
            success: true,
            absoluteDestinationFile: resolve(finalDestination),
        };
    } catch (e) {
        return { success: false, error: new Error(`Cannot copy file from ${source} to ${destination}. Error: ${getErrorMessage(e)}`) };
    }
}