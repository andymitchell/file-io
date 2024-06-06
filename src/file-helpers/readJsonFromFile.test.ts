import { getPackageDirectoryForSelfInTesting } from "../directory-helpers/getPackageDirectory"
import { readJsonFromFile, readJsonFromFileSync } from "./readJsonFromFile"

const TEST_ASSETS_DIR = `${getPackageDirectoryForSelfInTesting()}/test-assets`
describe("readJsonFromFile", () => {

    function runTests(type: 'sync' | 'async') {
        const genericReadJsonFromFile = type==='async'? readJsonFromFile : readJsonFromFileSync;
        test(`readJsonFromFile ${type}`, async () => {
            // @ts-ignore
            const result = await genericReadJsonFromFile(`${TEST_ASSETS_DIR}/json.json`);
            expect(result.object).toEqual({"hello": "world"});
            expect(result.file_found).toBe(true);
            expect(result.error).toBe(undefined);
        })
    
        test("readJsonFromFile - no file", async () => {
            // @ts-ignore
            const result = await genericReadJsonFromFile(`${TEST_ASSETS_DIR}/wrong-missing.json`);
            expect(result.object).toBe(undefined);
            expect(result.file_found).toBe(false);
            expect(!!result.error).toBe(true);
        })
    
        test("readJsonFromFile - invalid json", async () => {
            // @ts-ignore
            const result = await genericReadJsonFromFile(`${TEST_ASSETS_DIR}/corrupted.json.txt`);
            expect(result.object).toBe(undefined);
            expect(result.file_found).toBe(true);
            expect(!!result.error).toBe(true);
        })

        test("readJsonFromFile - invalid json - default object", async () => {
            // @ts-ignore
            const result = await genericReadJsonFromFile(`${TEST_ASSETS_DIR}/corrupted.json.txt`, {"bye": "world"});
            expect(result.object).toEqual({"bye": "world"});
            expect(result.file_found).toBe(true);
            expect(!!result.error).toBe(true);
        })

        test("readJsonFromFile - no file - default object", async () => {
            // @ts-ignore
            const result = await genericReadJsonFromFile(undefined, {"bye": "world"});
            expect(result.object).toEqual({"bye": "world"});
            expect(result.file_found).toBe(false);
            expect(!!result.error).toBe(true);
        })

        test("readJsonFromFile - fail with comments unless JSON5", async () => {
            // @ts-ignore
            const result = await genericReadJsonFromFile(`${TEST_ASSETS_DIR}/jsonWithComments.jsonc`, undefined, {vanilla_json: true});
            expect(result.object).toBe(undefined);
            expect(result.file_found).toBe(true);
            expect(!!result.error).toBe(true);

            // @ts-ignore
            const result1 = await genericReadJsonFromFile(`${TEST_ASSETS_DIR}/jsonWithComments.jsonc`);
            expect(!!result1.object).toBe(true);
            expect(result1.file_found).toBe(true);
            expect(!!result1.error).toBe(false);
        })
    }

    runTests('sync');
    runTests('async');

    
})