import { dirname } from "path";
import { fileURLToPath } from "url";
import { stripTrailingSep } from "../strip-trailing-sep/stripTrailingSep.ts";

/**
 * Retrieve the curent script's directory
 * 
 * It's equivalent to `stripTrailingSep(dirname(fileURLToPath(import.meta.url)))`
 * 
 * @param esmUrl The result of `import.meta.url` from your script 
 * @returns Normalised (no trailing slash) directory
 * 
 * @example
 * const __dirname = thisDir(import.meta.url)
 */
export function thisDir(esmUrl:string):string {
    return stripTrailingSep(dirname(fileURLToPath(esmUrl)));
}