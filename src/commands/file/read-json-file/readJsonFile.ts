
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
/**
 * Reads and parses a JSON (or JSON5) file from disk, returning either the parsed object
 * or a default fallback along with metadata indicating an issue. 
 * 
 * @param fileUri - The path or URI of the file to read. If `undefined` or empty, the function
 *                  immediately returns `{ object: defaultObject, file_found: false, error }`.
 * @param defaultObject - An optional object to return if the file is not found or if parsing fails.
 *                        If omitted, `object` will be `undefined` in those cases.
 * @param options.vanilla_json - When `true`, uses the built‑in `JSON.parse`. Otherwise falls back to `JSON5.parse`
 *                                to allow comments, trailing commas, and more relaxed syntax.
 *
 * @returns An object with:
 *   - `object`: the parsed JSON value (or the `defaultObject`/`undefined` on failure),
 *   - `file_found`: `true` if the file was read (even if parsing failed), `false` if the file was missing or `fileUri` was invalid,
 *   - `error`: an `Error` if reading or parsing failed, otherwise omitted.
 *
 * @example
 * // 1. Read a file, no default: returns `object` or `undefined`
 * const result1 = readJsonFile('/path/to/config.json');
 * if (!result1.file_found) {
 *   console.warn('Missing file; nothing to do.');
 * }
 * else if (result1.error) {
 *   console.error('Parse error:', result1.error);
 * }
 * else {
 *   console.log('Config:', result1.object);
 * }
 *
 * @example
 * // 2. Provide a default object if file is missing or broken:
 * const { object, file_found, error } = readJsonFile(
 *   '/path/to/optional.json',
 *   { fallback: true }
 * );
 * if (!file_found) {
 *   console.info('File not found; using default:', object);
 * } else if (error) {
 *   console.warn('Malformed JSON; used default instead:', error);
 * }
 *
 * @example
 * // 3. Force strict JSON parsing (no comments/trailing commas):
 * const strictResult = readJsonFile(
 *   '/strict.json',
 *   {},
 *   { vanilla_json: true }
 * );
 * if (strictResult.error) {
 *   console.error('Strict parsing failed:', strictResult.error);
 * }
 */
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