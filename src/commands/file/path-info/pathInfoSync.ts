import path from "node:path";
import fs from "node:fs";
import { stripTrailingSlash } from "../strip-trailing-slash/stripTrailingSlash.ts";
import type { PathInfo } from "./types.ts";

export function pathInfoSync(absolutePathToFile: string): PathInfo {
    const stats = fs.statSync(absolutePathToFile);

    if (stats.isDirectory()) {
        const dirname = stripTrailingSlash(absolutePathToFile);
        return {
            type: 'dir',
            dirname,
            uri: dirname
        };
    }

    let dirname = stripTrailingSlash(path.dirname(absolutePathToFile));
    if (dirname === '.') dirname = '';
    const basename = path.basename(absolutePathToFile);
    const name = path.basename(absolutePathToFile, path.extname(absolutePathToFile)); // (filename without extension)
    const extension_inc_dot = path.extname(absolutePathToFile);

    return {
        type: 'file',
        basename,
        extension: extension_inc_dot.replace(/^\./, ''),
        extension_inc_dot,
        name,
        dirname: dirname,
        uri: `${dirname ? `${dirname}/` : ''}${basename}`
    };
}