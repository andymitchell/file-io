import { getPackageDirectory } from "./getPackageDirectory"

describe('getPackageDirectory', () => {
    test('basic', async () => {
        const dir = await getPackageDirectory();
        const parts = dir.split('/');
        expect(parts[parts.length-1]).toBe('file-io');
    }, 1000*60)
})