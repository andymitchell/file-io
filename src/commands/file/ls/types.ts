import type { GlobOptions } from "glob";


export type LsOptions = {
    /**
     * Search in sub directories
     * 
     * @default false
     */
    recursive?: boolean,

    /**
     * What to include in the list 
     * 
     * @default 'both'
     */
    type?: 'file' | 'dir' | 'both'

    /**
     * Only match the given file name, with a RegExp 
     * 
     * It accepts: 
     * - glob style patterns (a string)
     * - RegExp (will run slower as it must first match all files)
     * 
     * If provided, it forces the `type` to be `file` 
     * 
     * @default null
     * 
     * @example
     * 'file1.ts'
     * 
     * @example
     * /file1\.ts/i
     */
    file_pattern?: string | RegExp | null

    /**
     * Follow symlinked directories when expanding ** patterns. This can result in a lot of duplicate references in the presence of cyclic links, and make performance quite bad.
     * 
     * By default, a ** in a pattern will follow 1 symbolic link if it is not the first item in the pattern, or none if it is the first item in the pattern, following the same behavior as Bash.
     * 
     * @default false
     */
    follow?: boolean,

    /**
     * Exclude any path with the glob-style pattern
     * 
     * @default []
     * 
     * @example 
     * ['** /.git/** /', '** /node_modules/** /'] will exclude any .git ande node_modules dir (nb remove spaces)
     */
    ignore?: string[]

    /**
     * Optionally override all options with the more complex `GlobOptions`. 
     * 
     * This takes precedence over everything. 
     */
    globOptions?: GlobOptions
};

export type ListedFile = {
    /**
     * The file name with the extension
     * 
     * @example 'file1.ts'
     */
    basename: string;

    /**
     * The directory, as an absolute path
     * 
     * @example 'user/tmp'
     */
    dirname: string;

    /**
     * The absolute directory and file name
     * 
     * @example 'usr/tmp/file1.ts'
     */
    uri: string
}