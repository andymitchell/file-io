import { existsSync, rmSync } from "node:fs";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";

type Response = {success: true, error?: undefined} | {success: false, error:Error};

/**
 * Like rmSync, but it won't complain if the file doesn't exist 
 * 
 * @param absolutePathToFile 
 * @param throwError 
 * @returns 
 */
export function removeFile(absolutePathToFile: string, throwError?:boolean):Response {
    const response = _removeFile(absolutePathToFile);

    if( response.success===false && throwError ) {
        throw response.error;
    }

    return response;
}

function _removeFile(absolutePathToFile: string):Response {
    try {
        if (!existsSync(absolutePathToFile)) return {success: true};
        rmSync(absolutePathToFile);
        return {success: true};
    } catch (e) {
        const error = new Error(`Cannot remove file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
        return {success: false, error};
    }
}