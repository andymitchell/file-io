import { existsSync, rmSync, statSync } from "node:fs";
import { getErrorMessage } from "../../../utils/getErrorMessage.ts";
import { absolute } from "../absolute/absolute.ts";

type SuccessResponse = {success: true, error?: undefined};
type Response = SuccessResponse | {success: false, error:Error};

/**
 * Like rmSync, but it won't complain if the file doesn't exist 
 * 
 * @param pathToFile Absolute or relative path 
 * @param throwError 
 * @returns 
 */
export function removeFileSync(pathToFile: string, throwError:true):SuccessResponse
export function removeFileSync(pathToFile: string, throwError?:boolean):Response
export function removeFileSync(pathToFile: string, throwError?:boolean):Response {
    const response = _removeFileSync(pathToFile);

    if( response.success===false && throwError ) {
        throw response.error;
    }

    return response;
}

function _removeFileSync(pathToFile: string):Response {
    const absolutePathToFile = absolute(pathToFile);
    try {
        if (!existsSync(absolutePathToFile)) {
            return {success: true};
        }

        if( statSync(absolutePathToFile).isDirectory() ) {
            return {success: false, error: new Error("Was given a directory. Use removeDirectory instead.")};
        }

        rmSync(absolutePathToFile);

        if( existsSync(absolutePathToFile) ) {
            return {success: false, error: new Error("Could not remove file. Did it have protective permissions?")};    
        } else {
            return {success: true};
        }
    } catch (e) {
        const error = new Error(`Cannot remove file ${absolutePathToFile}. Error: ${getErrorMessage(e)}`);
        return {success: false, error};
    }
}