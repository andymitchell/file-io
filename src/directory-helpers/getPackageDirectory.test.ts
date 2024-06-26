

import { getPackageDirectory, getPackageDirectorySync } from '.';
import {useNestedGetPackageDirectoryAny} from '../../test-assets/pkg-root/nm/@author/fake-this-pkg/useNestedGetPackageDirectory';
import {useGetPackageDirectoryAny} from '../../test-assets/pkg-root/nm/fake-this-pkg2/useGetPackageDirectory';
import { readJsonFromFile, readJsonFromFileSync } from '../file-helpers';


describe('getPackageDirectory', () => {
    runTests(getPackageDirectory);
    

})

describe('getPackageDirectorySync', () => {
    runTests(getPackageDirectorySync);
    
    test('give it to me', async () => {
        const result = readJsonFromFileSync("/Users/andymitchell/git/jra_combo/jra/node_modules/@andyrmitchell/supabase-workflow/package.json");
        debugger;
        expect(true).toBe(true);
    })
    
})

function getLastDirectory(path:string):string {
    const parts = path.split('/');
    return parts[parts.length-1] ?? '';
}

function runTests(getPackageDirectoryAny: typeof getPackageDirectory | typeof getPackageDirectorySync) {

    test('use a far away caller to check it is correct', async () => {
        //const result1 = getPackageDirectorySync({target: 'root'});


        const result = await useGetPackageDirectoryAny(getPackageDirectoryAny)
        expect(getLastDirectory(result.default)).toBe('fake-this-pkg2');
        expect(getLastDirectory(result.caller)).toBe('fake-this-pkg2');
        expect(getLastDirectory(result.fileio)).toBe('file-io');
        expect(getLastDirectory(result.root)).toBe('pkg-root');
        expect(getLastDirectory(result['root-rootiest'])).toBe('file-io');
        expect(getLastDirectory(result['root-caller-or-caller-consumer'])).toBe('pkg-root');

        
    })

    test('use a far away caller to check it is correct, when nested under author', async () => {
        //const result1 = getPackageDirectorySync({target: 'root'});


        const result = await useNestedGetPackageDirectoryAny(getPackageDirectoryAny)
        expect(getLastDirectory(result.default)).toBe('fake-this-pkg');
        expect(getLastDirectory(result.caller)).toBe('fake-this-pkg');
        expect(getLastDirectory(result.fileio)).toBe('file-io');
        expect(getLastDirectory(result.root)).toBe('pkg-root');
        expect(getLastDirectory(result['root-rootiest'])).toBe('file-io');
        expect(getLastDirectory(result['root-caller-or-caller-consumer'])).toBe('pkg-root');

        
    })

}
