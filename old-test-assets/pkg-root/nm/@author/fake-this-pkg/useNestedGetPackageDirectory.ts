import { getPackageDirectory, getPackageDirectorySync } from "../../../../../src/old/directory-helpers/getPackageDirectory.ts";


export async function useNestedGetPackageDirectoryAny(getPackageDirectoryAny: typeof getPackageDirectorySync | typeof getPackageDirectory) {
    
    return {
        'default': await getPackageDirectoryAny(), 
        'caller': await getPackageDirectoryAny({target:'caller'}),
        'root': await getPackageDirectoryAny({target:'root'}),
        'root-caller-or-caller-consumer': await getPackageDirectoryAny({target:'root', strategy: 'caller-or-caller-consumer'}),
        'root-rootiest': await getPackageDirectoryAny({target:'root', strategy: 'rootiest'}),
        'fileio': await getPackageDirectoryAny({target:'fileio'})
    }
}