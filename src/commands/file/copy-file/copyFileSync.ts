import { copyFileSync as nodeCopyFileSync, existsSync, mkdirSync } from "node:fs";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";
import { pathInfoSync } from "../path-info/pathInfoSync.ts";
import path from "node:path";

type Options = {
    overwrite?: boolean
}

/**
 * Copy a file to the destination (either a directory or specified file)
 * 
 * If the destination directory doesn't exist, it'll be created 
 * 
 * If you specify to overwrite, an existing file will be overwrite. Otherwise it'll return with an error. 
 * 
 * 
 * 
 * 
 * @param source 
 * @param destination 
 * @param options 
 */
export function copyFileSync(source: string, destination: string, options?: Options):{success: true, absoluteDestinationFile: string, error?: undefined} | {success: false, absoluteDestinationFile?: undefined, error: Error} {
    try {
        if (!existsSync(source)) {
            return { success: false, error: new Error(`Source file does not exist: ${source}`) };
        }

        let isDestDirectory = false;
        if (existsSync(destination)) {
            const info = pathInfoSync(destination);
            isDestDirectory = info.type==='dir';
        } else if (destination.endsWith(path.sep) || destination.endsWith('/')) {
            isDestDirectory = true;
        }

        const finalDestination = isDestDirectory
            ? path.join(destination, path.basename(source))
            : destination;

        if (existsSync(finalDestination) && !options?.overwrite) {
            return { success: false, error: new Error(`Destination file already exists and overwrite is not enabled: ${finalDestination}`) };
        }

        const destDir = path.dirname(finalDestination);
        if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
        }

        nodeCopyFileSync(source, finalDestination);

        return {
            success: true,
            absoluteDestinationFile: path.resolve(finalDestination),
        };
    } catch (e) {
        return { success: false, error: new Error(`Cannot copy file from ${source} to ${destination}. Error: ${getErrorMessage(e)}`) };
    }
}