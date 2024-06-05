
import { IFileIo, IFileIoSync } from '../types';
import { fileIoNode } from '../fileIoNode';
import { fileIoSyncNode } from '../fileIoSyncNode';

type ReadJson = {object:unknown, file_found:boolean, error?: Error};
export function readJsonFromFileSync(fileUri: string, fileIo?:IFileIoSync):ReadJson {
    if( !fileIo ) fileIo = fileIoSyncNode;

    const json = fileIo.read(fileUri);

    return processJson(fileUri, json);
}

export async function readJsonFromFile(fileUri: string, fileIo?:IFileIo):Promise<ReadJson> {
    if( !fileIo ) fileIo = fileIoNode;

    const json = await fileIo.read(fileUri);

    return processJson(fileUri, json);
}

function processJson(fileUri: string, json:string | undefined):ReadJson {
    if( typeof json==='string' ) {
        try {
            const object = JSON.parse(json);
            return {object, file_found: true};
        } catch(e) {
            return {
                object: undefined,
                file_found: true,
                error: new Error(`Failed to read json from ${fileUri}. Could not parse JSON: ${json}`)
            };
        }
    } else {
        return {
            object: undefined, 
            file_found: false,
            error: new Error(`Failed to read json from ${fileUri}.`)
        }
    }
}