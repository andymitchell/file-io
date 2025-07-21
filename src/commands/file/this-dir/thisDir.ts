import { dirname } from "path";
import { fileURLToPath } from "url";
import { stripTrailingSlash } from "../strip-trailing-slash/stripTrailingSlash.ts";

/**
 * Retrieve the curent script's directory
 * 
 * @param esmUrl The result of `import.meta.url` from your script 
 * @returns Normalised (no trailing slash) directory
 * 
 * @example
 * const __dirname = thisDir(import.meta.url)
 */
export function thisDir(esmUrl:string):string {
    return stripTrailingSlash(dirname(fileURLToPath(esmUrl)));
}