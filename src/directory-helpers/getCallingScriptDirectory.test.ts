import { getCallingScriptDirectorySync } from "./getCallingScriptDirectory";
import {useGetCallingScriptDirectory} from '../../test-assets/outside-dir/useGetCallingScriptDirectory';

describe('getCallingScriptDirectory', () => {
    
    
    test('basic', () => {
        const result = getCallingScriptDirectorySync();
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("directory-helpers");
        

        
    })

    test('outside', () => {
        const result = useGetCallingScriptDirectory();
        
        const parts = result.split('/');
        expect(parts[parts.length-1]).toBe("outside-dir");
        

        
    })
    
})
