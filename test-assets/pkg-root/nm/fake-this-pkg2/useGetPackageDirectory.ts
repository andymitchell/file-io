import { getPackageDirectory, getPackageDirectorySync } from "../../../../src/directory-helpers/getPackageDirectory";


export async function useGetPackageDirectoryAny(getPackageDirectoryAny: typeof getPackageDirectorySync | typeof getPackageDirectory) {
    
    return {
        'default': await getPackageDirectoryAny(), 
        'caller': await getPackageDirectoryAny({target:'caller'}),
        'root': await getPackageDirectoryAny({target:'root'}),
        'root-caller-or-caller-consumer': await getPackageDirectoryAny({target:'root', strategy: 'caller-or-caller-consumer'}),
        'root-rootiest': await getPackageDirectoryAny({target:'root', strategy: 'rootiest'}),
        'fileio': await getPackageDirectoryAny({target:'fileio'})
    }
}