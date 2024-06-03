export type ListFileOptions = {recurse?:boolean, file_pattern?:RegExp};
type ListedFile = {file:string, path: string, uri: string};
export interface IFileIo {
    read:(absolutePath:string) => Promise<string | undefined>;
    write:(absolutePath:string, content: string, append?: boolean, appendingSeparatorOnlyIfFileExists?:string) => Promise<void>;
    copy_file:(absolutePathSource:string, absolutePathDestination: string) => Promise<void>;
    list_files:(absolutePathDirectory:string, options?: ListFileOptions) => Promise<ListedFile[]>;
    make_directory(absolutePathDirectory:string):Promise<void>;
    remove_directory(absolutePathToDirectory:string, force?:boolean):Promise<void>;
    remove_file(absolutePathToFile:string):Promise<void>;
    directory_name(absolutePathToFileOrDirectory:string):string;
    has_directory(absolutePathDirectory:string):Promise<boolean>;
    has_file(absolutePathToFile:string):Promise<boolean>;
    chmod_file(absolutePathToFile:string, permissions:string):Promise<void>;
    execute_file(absolutePathToFile:string):Promise<string>
}