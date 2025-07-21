import { getCallingScriptDirectorySync } from "./getCallingScriptDirectory.js";
import {useGetCallingScriptDirectory} from '../../test-assets/outside-dir/useGetCallingScriptDirectory.js';

describe('getCallingScriptDirectory', () => {
    
    
    test('basic', () => {
        const result = getCallingScriptDirectorySync();
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("directory-helpers");
        

        
    });

    test('basic - begins with /', () => {
        const result = getCallingScriptDirectorySync();
        expect(result[0]).toBe('/');
        

        
    });

    test('exclude until function name', () => {
        const result = getCallingScriptDirectorySync('runTest');
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("process"); // Full line processTicksAndRejections (node:internal/process/task_queues:105:5)'

    })

    test('outside', () => {
        const result = useGetCallingScriptDirectory();
        
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("outside-dir");
        

        
    })
    
})
