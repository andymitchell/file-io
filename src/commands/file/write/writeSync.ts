import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";

type Options = {
    append?: boolean;
    overwrite?: boolean;
    make_directory?: boolean;
    appending_separator_only_if_file_exists?: string;
};

export function writeSync(
    absolutePath: string,
    content: string,
    options?: Options
): { success: true; error?: undefined } | { success: false; error: Error } {
    try {
        const hasFile = existsSync(absolutePath);

        if (options?.append) {
            if (hasFile && options?.appending_separator_only_if_file_exists) {
                content = `${options?.appending_separator_only_if_file_exists}${content}`;
            }
            appendFileSync(absolutePath, content);
        } else {
            if (!options?.overwrite && hasFile) {
                throw new Error("Cannot overwrite");
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
                `Cannot write file ${absolutePath}. Error: ${getErrorMessage(e)}`
            ),
        };
    }
}