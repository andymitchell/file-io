export type FileInfo = {
    type: 'file'

    /**
     * @example
     * file1.ts
     */
    basename:string, 

    /**
     * @example
     * ts
     */
    extension:string, 

    /**
     * @example
     * .ts
     */
    extension_inc_dot:string, 

    /**
     * @example
     * file1
     */
    name: string, 

    /**
     * The directory 
     * 
     * Always absolute
     * Never has a trailing slash
     * 
     * @example
     * /usr/tmp
     */
    dirname:string, 

    /**
     * @example
     * /usr/tmp/file1.ts
     */
    uri:string
};

export type DirectoryInfo = {
    type: 'dir',

    /**
     * The directory 
     * 
     * Always absolute 
     * Never has a trailing slash
     * 
     * @example
     * /usr/tmp
     */
    dirname:string


    /**
     * 
     * Same as `dirname`. 
     * 
     * Kept for easy type comparison
     * @example
     * /usr/tmp
     */
    uri:string
}

export type PathInfo = FileInfo | DirectoryInfo;