
import { IFileIo, IFileIoSync } from '../types';
import { fileIoNode } from '../fileIoNode';
import { fileIoSyncNode } from '../fileIoSyncNode';
import * as JSON5 from 'json5'

type DefaultObject = Record<string, any>;
type OptionsSync = {file_io?:IFileIoSync, vanilla_json?:boolean};
type OptionsAsync = {file_io?:IFileIo, vanilla_json?:boolean};

function missingFileUriReadJson(fileUri:string | undefined, defaultObject?:DefaultObject) {
    return {object: defaultObject ?? undefined, file_found: false, error: new Error(`Failed to read json from ${fileUri}. No file uri.`)};
}

type ReadJson = {object:Record<string, any>, file_found:boolean, error?: Error};
type ReadJsonWithUndefined = {object:Record<string, any> | undefined, file_found:boolean, error?: Error};
export function readJsonFromFileSync(fileUri: string | undefined, defaultObject?:undefined, options?:OptionsSync):ReadJsonWithUndefined;
export function readJsonFromFileSync(fileUri: string | undefined, defaultObject:DefaultObject, options?:OptionsSync):ReadJson;
export function readJsonFromFileSync(fileUri: string | undefined, defaultObject?:DefaultObject, options?:OptionsSync):ReadJsonWithUndefined {
    const fileIo = options?.file_io ?? fileIoSyncNode;
    if( !fileUri ) return missingFileUriReadJson(fileUri, defaultObject);

    const json = fileIo.read(fileUri);

    return processJson(fileUri, json, defaultObject, options?.vanilla_json);
}

export async function readJsonFromFile(fileUri: string | undefined, defaultObject?:undefined, options?:OptionsAsync):Promise<ReadJsonWithUndefined>;
export async function readJsonFromFile(fileUri: string | undefined, defaultObject:DefaultObject, options?:OptionsAsync):Promise<ReadJson>;
export async function readJsonFromFile(fileUri: string | undefined, defaultObject?:DefaultObject, options?:OptionsAsync):Promise<ReadJsonWithUndefined> {
    const fileIo = options?.file_io ?? fileIoNode;
    if( !fileUri ) return missingFileUriReadJson(fileUri, defaultObject);

    const json = await fileIo.read(fileUri);

    return processJson(fileUri, json, defaultObject, options?.vanilla_json);
}

function processJson(fileUri: string, json:string | undefined, defaultObject?:DefaultObject, useVanillaJson?:boolean):ReadJsonWithUndefined {
    if( typeof json==='string' ) {
        try {
            const jsoner = useVanillaJson? JSON : JSON5;
            const object = jsoner.parse(json);
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