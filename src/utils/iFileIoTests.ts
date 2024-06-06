
import { existsSync, mkdirSync, rmdirSync, writeFileSync, rmSync, statSync } from 'fs';
import * as path from 'path';
import { IFileIo, IFileIoSync } from '../types';
import { getPackageDirectoryForSelfInTesting } from '../directory-helpers/getPackageDirectory';




export function iFileIoTests(fileIo:IFileIo | IFileIoSync) {
    
    const TMP_DIR_ROOT = `${getPackageDirectoryForSelfInTesting()}/tmp_ifileio_tests`;
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

    test('reads a file', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        const content = 'Hello, world!';
        writeFileSync(filePath, content);

        const result = await fileIo.read(filePath);
        expect(result).toBe(content);
    });

    test('reads a file - missing is undefined', async () => {
        const filePath = path.join(TMP_DIR, 'test-no-exists-4943.txt');
        const content = 'Hello, world!';
        
        const result = await fileIo.read(filePath);
        expect(result).toBe(undefined);
    });

    test('writes to a file', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        const content = 'Hello, world!';

        await fileIo.write(filePath, content);

        const result = await fileIo.read(filePath);
        expect(result).toBe(content);
    });

    test('writes to a file - non existent dir fails', async () => {
        const filePath = path.join(`${TMP_DIR}/subdir09258`, 'test.txt');
        const content = 'Hello, world!';

        let error = false;
        try {
            await fileIo.write(filePath, content);
        } catch(e) {
            error = true;
        }
        expect(error).toBe(true);

        //const result = await fileIo.read(filePath);
        //expect(result).toBe(content);
    });

    test('writes to a file - no overwriting if exists', async () => {
        const filePath = path.join(`${TMP_DIR}`, 'test_exists.txt');
        const content = 'Hello, world!';
        const nextContent = 'Farewell, world!';

        await fileIo.write(filePath, content);
        const result1 = await fileIo.read(filePath);
        expect(result1).toBe(content);

        
        let error = false;
        try {
            await fileIo.write(filePath, nextContent);
        } catch(e) {
            error = true;
        }
        expect(error).toBe(true);

        const result = await fileIo.read(filePath);
        expect(result).toBe(content);
    });

    test('writes to a file - overwrite wins', async () => {
        const filePath = path.join(`${TMP_DIR}`, 'test_exists.txt');
        const content = 'Hello, world!';
        const nextContent = 'Farewell, world!';

        await fileIo.write(filePath, content);
        const result1 = await fileIo.read(filePath);
        expect(result1).toBe(content);

        
        let error = false;
        try {
            await fileIo.write(filePath, nextContent, {overwrite: true});
        } catch(e) {
            error = true;
        }
        expect(error).toBe(false);

        const result = await fileIo.read(filePath);
        expect(result).toBe(nextContent);
    });

    test('appends to a file', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        const content1 = 'Hello,';
        const content2 = ' world!';

        await fileIo.write(filePath, content1);
        await fileIo.write(filePath, content2, {append: true});

        const result = await fileIo.read(filePath);
        expect(result).toBe(content1 + content2);
    });


    test('copies a file', async () => {
        const sourcePath = path.join(TMP_DIR, 'source.txt');
        const destPath = path.join(TMP_DIR, 'dest.txt');
        const content = 'Hello, world!';
        writeFileSync(sourcePath, content);

        await fileIo.copy_file(sourcePath, destPath);

        const result = await fileIo.read(destPath);
        expect(result).toBe(content);
    });


    test('copies a file - no overwrite by default', async () => {
        const sourcePath = path.join(TMP_DIR, 'source.txt');
        const destPath = path.join(TMP_DIR, 'dest.txt');
        const content = 'Hello, world!';
        const oldContent = 'Farewell friends';
        writeFileSync(sourcePath, content);
        writeFileSync(destPath, oldContent);

        let error = false
        try {
            await fileIo.copy_file(sourcePath, destPath);
        } catch(e) {
            error = true;
        }

        expect(error).toBe(true);
        const result = await fileIo.read(destPath);
        expect(result).toBe(oldContent);
    });

    test('copies a file - overwriting even if exists', async () => {
        const sourcePath = path.join(TMP_DIR, 'source.txt');
        const destPath = path.join(TMP_DIR, 'dest.txt');
        const content = 'Hello, world!';
        writeFileSync(sourcePath, content);
        writeFileSync(destPath, 'Farewell friends');

        await fileIo.copy_file(sourcePath, destPath, {overwrite:true});

        const result = await fileIo.read(destPath);
        expect(result).toBe(content);
    });

    test('copies a file - fails if no destination dir', async () => {
        const sourcePath = path.join(TMP_DIR, 'source.txt');
        const destPath = path.join(`${TMP_DIR}/subdir9385`, 'dest.txt');
        const content = 'Hello, world!';
        writeFileSync(sourcePath, content);

        let error = false;
        try {
            await fileIo.copy_file(sourcePath, destPath);
        } catch(e) {
            error = true;
        }

        expect(error).toBe(true);
    });

    test('copies a file - mkdir if needed', async () => {
        const sourcePath = path.join(TMP_DIR, 'source.txt');
        const destPath = path.join(`${TMP_DIR}/subdir9385`, 'dest.txt');
        const content = 'Hello, world!';
        writeFileSync(sourcePath, content);


        await fileIo.copy_file(sourcePath, destPath, {'make_directory': true});
        
        const result = await fileIo.read(destPath);
        expect(result).toBe(content);
    });

    test('lists files in a directory', async () => {
        const filePath1 = path.join(TMP_DIR, 'test1.txt');
        const filePath2 = path.join(TMP_DIR, 'test2.txt');
        writeFileSync(filePath1, 'Content 1');
        writeFileSync(filePath2, 'Content 2');

        const files = await fileIo.list_files(TMP_DIR);
        

        expect(files).toEqual([
            { file: 'test1.txt', path: TMP_DIR, uri: `${TMP_DIR}/test1.txt` },
            { file: 'test2.txt', path: TMP_DIR, uri: `${TMP_DIR}/test2.txt` },
        ]);
    });


    test('lists files with recursion', async () => {
        const subDir = path.join(TMP_DIR, 'sub');
        const filePath1 = path.join(TMP_DIR, 'test1.txt');
        const filePath2 = path.join(subDir, 'test2.txt');
        mkdirSync(subDir);
        writeFileSync(filePath1, 'Content 1');
        writeFileSync(filePath2, 'Content 2');

        const files = await fileIo.list_files(TMP_DIR, { recurse: true });

        expect(files).toEqual([
            { file: 'test1.txt', path: TMP_DIR, uri: `${TMP_DIR}/test1.txt` },
            { file: 'test2.txt', path: subDir, uri: `${subDir}/test2.txt` },
        ]);
    });

    test('lists files with a pattern', async () => {
        const filePath1 = path.join(TMP_DIR, 'test1.txt');
        const filePath2 = path.join(TMP_DIR, 'sample.txt');
        writeFileSync(filePath1, 'Content 1');
        writeFileSync(filePath2, 'Content 2');

        const files = await fileIo.list_files(TMP_DIR, { file_pattern: /^test/ });

        expect(files).toEqual([
            { file: 'test1.txt', path: TMP_DIR, uri: `${TMP_DIR}/test1.txt` },
        ]);
    });

    test('creates a directory', async () => {
        const dirPath = path.join(TMP_DIR, 'newDir');

        await fileIo.make_directory(dirPath);

        expect(existsSync(dirPath)).toBe(true);
    });

    test('removes a directory', async () => {
        const dirPath = path.join(TMP_DIR, 'newDir');
        await fileIo.make_directory(dirPath);

        await fileIo.remove_directory(dirPath, false);

        expect(existsSync(dirPath)).toBe(false);
    });

    test('removes a directory with force', async () => {
        const dirPath = path.join(TMP_DIR, 'newDir');
        await fileIo.make_directory(dirPath);
        const filePath = path.join(dirPath, 'test.txt');
        writeFileSync(filePath, 'Content');

        await fileIo.remove_directory(dirPath, true);

        expect(existsSync(dirPath)).toBe(false);
    });

    test('removes a file', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        writeFileSync(filePath, 'Content');

        await fileIo.remove_file(filePath);

        expect(existsSync(filePath)).toBe(false);
    });

    test('checks if a directory exists', async () => {
        const dirPath = path.join(TMP_DIR, 'newDir');
        await fileIo.make_directory(dirPath);

        const result = await fileIo.has_directory(dirPath);
        expect(result).toBe(true);
    });

    test('checks if a file exists', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        writeFileSync(filePath, 'Content');

        const result = await fileIo.has_file(filePath);
        expect(result).toBe(true);
    });

    test('changes file permissions', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        writeFileSync(filePath, 'Content');

        await fileIo.chmod_file(filePath, '755');

        const stat = statSync(filePath);
        expect((stat.mode & 0o777).toString(8)).toBe('755');
    });

    // The execute_file function cannot be tested as it requires an executable script to be present and executed.
    // We can add a placeholder test if needed.

    test('gets the directory name', async () => {
        const filePath = path.join(TMP_DIR, 'test.txt');
        const result = await fileIo.directory_name(filePath);
        expect(result).toBe(TMP_DIR);
    });

}
