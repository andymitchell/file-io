import { relative as nodeRelative } from "node:path";

export function relative(fromAbsolutePathDirectoryOrFile: string, toAbsolutePathDirectoryOrFile: string) {
    const relPath = nodeRelative(fromAbsolutePathDirectoryOrFile, toAbsolutePathDirectoryOrFile);
    return `${relPath.indexOf('../') !== 0 ? './' : ''}${relPath}`;
}