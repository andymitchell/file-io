import { getCallingScriptDirectorySync } from "./getCallingScriptDirectory";
import {useGetCallingScriptDirectory} from '../../test-assets/outside-dir/useGetCallingScriptDirectory';

describe('getCallingScriptDirectory', () => {
    
    
    test('basic', () => {
        const result = getCallingScriptDirectorySync();
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("directory-helpers");
        

        
    });

    test('basic - begins with /', () => {
        const result = getCallingScriptDirectorySync();
        debugger;
        expect(result[0]).toBe('/');
        

        
    });

    test('exclude until function name', () => {
        const result = getCallingScriptDirectorySync('Object.<anonymous>');
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("build"); // Full line <local path>/file-io/node_modules/jest-circus/build/utils.js

    })

    test('outside', () => {
        const result = useGetCallingScriptDirectory();
        
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("outside-dir");
        

        
    })
    
})
