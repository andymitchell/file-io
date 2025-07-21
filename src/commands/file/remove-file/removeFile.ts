import { existsSync, rmSync } from "node:fs";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";

export function removeFile(absolutePathToFile: string) {
    try {
        if (!existsSync(absolutePathToFile)) return;
        rmSync(absolutePathToFile);
    } catch (e) {
        throw new Error(`Cannot remove file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
    }
}