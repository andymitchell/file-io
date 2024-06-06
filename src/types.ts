export type ListFileOptions = { recurse?: boolean, file_pattern?: RegExp };
type ListedFile = { file: string, path: string, uri: string };


type Asyncify<T> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Promise<Return>
    : never;
};

export interface IFileIoSync {
    read: (absolutePath: string) => string | undefined;
    write: (absolutePath: string, content: string, options?: { append?: boolean, overwrite?: boolean, make_directory?:boolean, appending_separator_only_if_file_exists?: string}) => void;
    copy_file: (absolutePathSource: string, absolutePathDestination: string, options?: {overwrite?: boolean, make_directory?:boolean}) => void;
    list_files: (absolutePathDirectory: string, options?: ListFileOptions) => ListedFile[];
    make_directory(absolutePathDirectory: string): void;
    remove_directory(absolutePathToDirectory: string, force?: boolean): void;
    remove_file(absolutePathToFile: string): void;
    directory_name(absolutePathToFileOrDirectory: string): string;
    has_directory(absolutePathDirectory: string): boolean;
    has_file(absolutePathToFile: string): boolean;
    chmod_file(absolutePathToFile: string, permissions: string): void;
    execute(commandOrPathToFile: string, interactive?:boolean): string
    /**
     * Returns the relative path from fromAbsolutePathDirectoryOrFile to toAbsolutePathDirectoryOrFile
     * @param fromAbsolutePathDirectoryOrFile 
     * @param toAbsolutePathDirectoryOrFile 
     */
    relative(fromAbsolutePathDirectoryOrFile:string, toAbsolutePathDirectoryOrFile:string, prefixCurrentDirectoryIndicator?:boolean):string;
}

export interface IFileIo extends Asyncify<IFileIoSync> {};
