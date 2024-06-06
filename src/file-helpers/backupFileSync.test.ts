import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { getPackageDirectoryForSelfInTesting } from "../directory-helpers/getPackageDirectory";
import * as path from 'path';
import { backupFileSync } from "./backupFileSync";
import { fileIoSyncNode } from "../fileIoSyncNode";

describe('backupFileSync', () => {
    const TMP_DIR_ROOT = `${getPackageDirectoryForSelfInTesting()}/tmp_backupFile_tests`;
    let TMP_DIR:string;
    beforeAll(async () => {
        TMP_DIR = `${TMP_DIR_ROOT}/${Math.round(Math.random()*1000000)+''}`;
        rmSync(TMP_DIR_ROOT, { recursive: true, force: true });
    });
    afterAll(async () => {
        rmSync(TMP_DIR_ROOT, { recursive: true, force: true });
    });

    beforeEach(() => {
        if (!existsSync(TMP_DIR)) {
            mkdirSync(TMP_DIR, {recursive: true});
        }
    });
    
    afterEach(() => {
        rmSync(TMP_DIR, { recursive: true, force: true });
    });

    test('backup a file', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        const content = 'Hello, world!';
        writeFileSync(filePath, content);

        const backupUri = backupFileSync(filePath) ?? '';
        expect(filePath!==backupUri).toBe(true);
        expect(fileIoSyncNode.directory_name(filePath)).toBe(fileIoSyncNode.directory_name(backupUri));

        const result = fileIoSyncNode.read(backupUri);
        expect(result).toBe(content);
    });

    test('backup a file is unique every time', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        const content = 'Hello, world!';
        writeFileSync(filePath, content);

        const backupUri1 = backupFileSync(filePath) ?? '';
        const backupUri2 = backupFileSync(filePath) ?? '';
        expect(backupUri1!==backupUri2).toBe(true);
        expect(fileIoSyncNode.directory_name(filePath)).toBe(fileIoSyncNode.directory_name(backupUri2));

        expect(fileIoSyncNode.has_file(backupUri1)).toBe(true);
        expect(fileIoSyncNode.has_file(backupUri2)).toBe(true);

        const result = fileIoSyncNode.read(backupUri2);
        expect(result).toBe(content);
    });
})