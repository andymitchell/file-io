

import { fileIoSyncNode } from "./fileIoSyncNode.js";
import { iFileIoTests } from "./utils/iFileIoTests.js";

describe('fileIoNode test', () => {
    

    iFileIoTests(fileIoSyncNode, 'IFileIoSync');
})

/*
test.only('', async () => {

    const result = fileIoSyncNode.list_files(
        '/Users/andymitchell/git/breef/store',
        {
            file_pattern: /sqlSchemaCreator.ts/
        }
    )
    
    console.log({result})

})
*/