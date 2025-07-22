/**
 * In tests on cwd, when setting the cwd dir on process, it seems to use a /private prefix to it all. 
 * 
 * It's probably a better idea to understand this properly but I'm hack fixing it for now. 
 * 
 * @param path 
 * @returns 
 */
export function privatifyPath(path:string):string {
    return `/private${path}`;
}