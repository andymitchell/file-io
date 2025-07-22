import { sep } from "node:path";

export function stripTrailingSep(path:string):string {
    if( !path ) debugger;
    return path.endsWith(sep)? path.slice(0, -1) : path;
}