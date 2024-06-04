
import { getPackageDirectory, getPackageDirectoryForSelfInTesting, getPackageDirectorySync } from "./getPackageDirectory"



describe('getPackageDirectory', () => {
    runTests(getPackageDirectory);
    
    
})

describe('getPackageDirectorySync', () => {
    runTests(getPackageDirectorySync);
    
    
})

function runTests(getPackageDirectoryAny: typeof getPackageDirectory | typeof getPackageDirectorySync) {
    test('skips us because we are is_andyrmitchell_file_io_package', async () => {
        const dir = await getPackageDirectoryAny();
        expect(dir).toBe('');
        
    }, 1000*60)

    test('finds us if forced', async () => {
        const dir = await getPackageDirectoryForSelfInTesting();
        const parts = dir.split('/');
        expect(parts[parts.length-1]).toBe('file-io');
        
    }, 1000*60)

    test('skip fake-this-pkg because it is is_andyrmitchell_file_io_package', async () => {
        const root = await getPackageDirectoryForSelfInTesting();
        const dir = await getPackageDirectoryAny(`${root}/test-env/pkg-root/node_modules/fake-this-pkg`);
        const parts = dir.split('/');
        expect(parts[parts.length-1]).toBe('pkg-root');
        
    }, 1000*60)
}
