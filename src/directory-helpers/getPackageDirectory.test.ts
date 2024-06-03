
import { getPackageDirectory, getPackageDirectoryInternal } from "./getPackageDirectory"

describe('getPackageDirectory', () => {
    test('skips us because we are is_andyrmitchell_file_io_package', async () => {
        const dir = await getPackageDirectory();
        expect(dir).toBe('');
        
    }, 1000*60)

    test('finds us if forced', async () => {
        const dir = await getPackageDirectoryInternal(undefined, undefined, undefined, {'testing_skip_package_check': true});
        const parts = dir.split('/');
        expect(parts[parts.length-1]).toBe('file-io');
        
    }, 1000*60)

    test('skip fake-this-pkg because it is is_andyrmitchell_file_io_package', async () => {
        const root = await getPackageDirectoryInternal(undefined, undefined, undefined, {'testing_skip_package_check': true});
        const dir = await getPackageDirectory(`${root}/test-env/pkg-root/node_modules/fake-this-pkg`);
        const parts = dir.split('/');
        expect(parts[parts.length-1]).toBe('pkg-root');
        
    }, 1000*60)
})