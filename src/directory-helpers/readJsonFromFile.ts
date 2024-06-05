
import { IFileIo, IFileIoSync } from '../types';
import { fileIoNode } from '../fileIoNode';
import { fileIoSyncNode } from '../fileIoSyncNode';

type ReadJson = {object:unknown, file_found:boolean, error?: Error};
export function readJsonFromFileSync(fileUri: string, defaultObject?:Record<string, any>, fileIo?:IFileIoSync):ReadJson {
    if( !fileIo ) fileIo = fileIoSyncNode;

    const json = fileIo.read(fileUri);

    return processJson(fileUri, json, defaultObject);
}

export async function readJsonFromFile(fileUri: string, defaultObject?:Record<string, any>, fileIo?:IFileIo):Promise<ReadJson> {
    if( !fileIo ) fileIo = fileIoNode;

    const json = await fileIo.read(fileUri);

    return processJson(fileUri, json, defaultObject);
}

function processJson(fileUri: string, json:string | undefined, defaultObject?:Record<string, any>, ):ReadJson {
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
            error: new Error(`Failed to read json from ${fileUri}.`)
        }
    }
}