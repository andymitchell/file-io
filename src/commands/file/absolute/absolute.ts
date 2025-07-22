import { isAbsolute, resolve, sep } from "path";
import { cwd } from "process";
import { stripTrailingSep } from "../strip-trailing-sep/stripTrailingSep.ts";

/**
 * Resolves a file path to an absolute path.
 * 
 * @param filePath A relative or absolute file path. If relative, it's resolved relative to the `current working directory`.
 * @returns Absolute path, with no trailing slash
 *
 * @example
 * absolute("src/index.ts"); // -> /Users/you/project/src/index.ts
 * absolute("./src/index.ts"); // -> /Users/you/project/src/index.ts
 * absolute("/etc/passwd");  // -> /etc/passwd
 * absolute("/etc/passwd/");  // -> /etc/passwd
 */
export function absolute(filePath: string): string {
    return stripTrailingSep(absoluteWithoutStrippingTrailingSep(filePath));
}

/**
 * Maintains the ending of the path as is 
 * @param filePath 
 * @returns 
 */
export function absoluteWithoutStrippingTrailingSep(filePath: string): string {
    const endsInSep = filePath.endsWith(sep);
    let path = isAbsolute(filePath) ? filePath : resolve(cwd(), filePath);
    
    if( endsInSep && path && !path.endsWith(sep) ) {
        path += sep;
    }

    return path;
}