

import { getPackageDirectory, getPackageDirectorySync } from '.';
import {useGetPackageDirectoryAny} from '../../test-assets/pkg-root/nm/fake-this-pkg/useGetPackageDirectory';


describe('getPackageDirectory', () => {
    runTests(getPackageDirectory);
    

})

describe('getPackageDirectorySync', () => {
    runTests(getPackageDirectorySync);
    
    
    
    
})

function getLastDirectory(path:string):string {
    const parts = path.split('/');
    return parts[parts.length-1] ?? '';
}

function runTests(getPackageDirectoryAny: typeof getPackageDirectory | typeof getPackageDirectorySync) {

    test('use a far away caller to check it is correct', async () => {
        //const result1 = getPackageDirectorySync({target: 'root'});


        const result = await useGetPackageDirectoryAny(getPackageDirectoryAny)
        expect(getLastDirectory(result.default)).toBe('pkg-root');
        expect(getLastDirectory(result.caller)).toBe('fake-this-pkg');
        expect(getLastDirectory(result.fileio)).toBe('file-io');
        expect(getLastDirectory(result.root)).toBe('pkg-root');
        expect(getLastDirectory(result['root-any'])).toBe('file-io');
        expect(getLastDirectory(result['root-caller-or-caller-consumer'])).toBe('pkg-root');

        
    })

}
