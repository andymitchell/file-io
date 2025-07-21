
import JSON5 from 'json5';
import { readFileSync } from 'node:fs';

type DefaultObject = Record<string, any>;
type Options = {vanilla_json?:boolean};

function missingFileUriReadJson(fileUri:string | undefined, defaultObject?:DefaultObject) {
    return {object: defaultObject ?? undefined, file_found: false, error: new Error(`Failed to read json from ${fileUri}. No file uri.`)};
}

type ReadJson = {object:Record<string, any>, file_found:boolean, error?: Error};
type ReadJsonWithUndefined = {object:Record<string, any> | undefined, file_found:boolean, error?: Error};
export function readJsonFile(fileUri: string | undefined, defaultObject?:undefined, options?:Options):ReadJsonWithUndefined;
export function readJsonFile(fileUri: string | undefined, defaultObject:DefaultObject, options?:Options):ReadJson;
export function readJsonFile(fileUri: string | undefined, defaultObject?:DefaultObject, options?:Options):ReadJsonWithUndefined {
    if( !fileUri ) return missingFileUriReadJson(fileUri, defaultObject);

    let json: string | undefined;
    try {
        json = readFileSync(fileUri, 'utf-8');
    } catch(e) {}

    return processJson(fileUri, json, defaultObject, options?.vanilla_json);
}


function processJson(fileUri: string, json:string | undefined, defaultObject?:DefaultObject, useVanillaJson?:boolean):ReadJsonWithUndefined {
    if( typeof json==='string' ) {
        try {
            const jsoner = useVanillaJson? JSON : JSON5;
            const object = jsoner.parse(json);
            return {object, file_found: true};
        } catch(e) {
            const message = e instanceof Error? e.message : 'na';
            return {
                object: defaultObject ?? undefined,
                file_found: true,
                error: new Error(`Failed to read json from ${fileUri}. Could not parse JSON because: ${message}. JSON: ${json}`)
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