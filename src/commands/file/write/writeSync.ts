import { appendFileSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";
import { absolute } from "../absolute/absolute.ts";

type Options = {
    append?: boolean;
    overwrite?: boolean;
    make_directory?: boolean;
    appending_separator_only_if_file_exists?: string;
};

type SuccessResponse = { success: true; error?: undefined } ;
type Response = SuccessResponse| { success: false; error: Error };

/**
 * Synchronously writes content to a file, with convenient options for appending,
 * overwriting, and directory creation.
 *
 * @param path - The absolute or relative path to the file to write.
 * @param content - The string content to write to the file.
 * @param options - Optional settings:
 *   @param options.append - If `true`, appends `content` to the file instead of overwriting.
 *   @param options.overwrite - If `false` (default) and the file already exists when not appending,
 *     an error is thrown; set to `true` to allow overwriting.
 *   @param options.make_directory - If `true`, creates missing directories in the file's path.
 *   @param options.appending_separator_only_if_file_exists - When appending and the file exists,
 *     this string is prepended before `content` (e.g. a newline).
 *
 * @returns An object indicating success or failure:
 *   - `{ success: true }` on success.
 *   - `{ success: false; error: Error }` on failure, with an Error describing the problem.
 *
 * @example
 * // Basic overwrite (default behavior):
 * const result = writeSync('/tmp/log.txt', 'Server started\n');
 * // => writes (or overwrites) '/tmp/log.txt' with "Server started\n"
 *
 * @example
 * // Append with newline only if file exists:
 * writeSync('/tmp/log.txt', 'Request received', {
 *   append: true,
 *   appending_separator_only_if_file_exists: '\n'
 * });
 * // => if '/tmp/log.txt' exists, appends "\nRequest received"; otherwise writes "Request received"
 *
 * @example
 * // Prevent accidental overwrite:
 * writeSync('/tmp/config.json', '{ "mode": "prod" }', {
 *   overwrite: false
 * });
 * // => throws error if '/tmp/config.json' already exists
 *
 * @example
 * // Automatically create directories then write:
 * writeSync('/var/app/data/output.txt', 'Data payload', {
 *   make_directory: true
 * });
 * // => creates '/var/app/data' if missing, then writes file
 *
 */
export function writeSync(path: string, content: string, options: Options | undefined, throwError: true): SuccessResponse
export function writeSync(path: string, content: string, options?: Options, throwError?: boolean): Response
export function writeSync(path: string, content: string, options?: Options, throwError?: boolean): Response {

    const response = _writeSync(path, content, options);

    
    if( response.success===false && throwError ) {
        throw response.error;
    } 
    return response;

}


function _writeSync(
    path: string,
    content: string,
    options?: Options
): Response {
    try {
        const absolutePath = absolute(path);

        const hasFile = existsSync(absolutePath);
        if( hasFile && statSync(absolutePath).isDirectory() ) return {success: false, error: new Error('Pointed to a directory')};

        if (options?.append) {
            if (hasFile && options?.appending_separator_only_if_file_exists) {
                content = `${options?.appending_separator_only_if_file_exists}${content}`;
            }
            appendFileSync(absolutePath, content);
        } else {
            if (!options?.overwrite && hasFile) {
                throw new Error("Cannot overwrite. Need to set 'overwrite' option.");
            }

            if (!hasFile && options?.make_directory) {
                const dir = dirname(absolutePath);
                if (!existsSync(dir)) {
                    mkdirSync(dir, { recursive: true });
                }
            }

            writeFileSync(absolutePath, content);
        }
        return { success: true };
    } catch (e) {
        return {
            success: false,
            error: new Error(
                `Cannot write file ${path}. Error: ${getErrorMessage(e)}`
            ),
        };
    }
}