export type ListFileOptions = { recurse?: boolean, file_pattern?: RegExp };
type ListedFile = { file: string, path: string, uri: string };


type Asyncify<T> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Promise<Return>
    : never;
};

export interface IFileIoSync {
    read: (absolutePath: string) => string | undefined;
    write: (absolutePath: string, content: string, append?: boolean, appendingSeparatorOnlyIfFileExists?: string) => void;
    copy_file: (absolutePathSource: string, absolutePathDestination: string, forceOverwrite?:boolean) => void;
    list_files: (absolutePathDirectory: string, options?: ListFileOptions) => ListedFile[];
    make_directory(absolutePathDirectory: string): void;
    remove_directory(absolutePathToDirectory: string, force?: boolean): void;
    remove_file(absolutePathToFile: string): void;
    directory_name(absolutePathToFileOrDirectory: string): string;
    has_directory(absolutePathDirectory: string): boolean;
    has_file(absolutePathToFile: string): boolean;
    chmod_file(absolutePathToFile: string, permissions: string): void;
    execute_file(absolutePathToFile: string, interactive?:boolean): string
}

export interface IFileIo extends Asyncify<IFileIoSync> {};
