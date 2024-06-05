
import { IFileIo, IFileIoSync } from '../types';
import { fileIoNode } from '../fileIoNode';
import { fileIoSyncNode } from '../fileIoSyncNode';

type DefaultObject = Record<string, any>;

function missingFileUriReadJson(fileUri:string | undefined, defaultObject?:DefaultObject) {
    return {object: defaultObject ?? undefined, file_found: false, error: new Error(`Failed to read json from ${fileUri}. No file uri.`)};
}

type ReadJson = {object:Record<string, any>, file_found:boolean, error?: Error};
type ReadJsonWithUndefined = {object:Record<string, any> | undefined, file_found:boolean, error?: Error};
export function readJsonFromFileSync(fileUri: string | undefined, defaultObject?:undefined, fileIo?:IFileIoSync):ReadJsonWithUndefined;
export function readJsonFromFileSync(fileUri: string | undefined, defaultObject:DefaultObject, fileIo?:IFileIoSync):ReadJson;
export function readJsonFromFileSync(fileUri: string | undefined, defaultObject?:DefaultObject, fileIo?:IFileIoSync):ReadJsonWithUndefined {
    if( !fileIo ) fileIo = fileIoSyncNode;
    if( !fileUri ) return missingFileUriReadJson(fileUri, defaultObject);

    const json = fileIo.read(fileUri);

    return processJson(fileUri, json, defaultObject);
}

export async function readJsonFromFile(fileUri: string | undefined, defaultObject?:undefined, fileIo?:IFileIo):Promise<ReadJsonWithUndefined>;
export async function readJsonFromFile(fileUri: string | undefined, defaultObject:DefaultObject, fileIo?:IFileIo):Promise<ReadJson>;
export async function readJsonFromFile(fileUri: string | undefined, defaultObject?:DefaultObject, fileIo?:IFileIo):Promise<ReadJsonWithUndefined> {
    if( !fileIo ) fileIo = fileIoNode;
    if( !fileUri ) return missingFileUriReadJson(fileUri, defaultObject);

    const json = await fileIo.read(fileUri);

    return processJson(fileUri, json, defaultObject);
}

function processJson(fileUri: string, json:string | undefined, defaultObject?:DefaultObject, ):ReadJsonWithUndefined {
    if( typeof json==='string' ) {
        try {
            const object = JSON.parse(json);
            return {object, file_found: true};
        } catch(e) {
            return {
                object: defaultObject ?? undefined,
                file_found: true,
                error: new Error(`Failed to read json from ${fileUri}. Could not parse JSON: ${json}`)
            };
        }
    } else {
        return {
            object: defaultObject ?? undefined, 
            file_found: false,
            error: new Error(`Failed to read json from ${fileUri}. Bad file uri.`)
        }
    }
}