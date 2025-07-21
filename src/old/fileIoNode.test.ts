
import { fileIoNode } from "./fileIoNode.js";
import { iFileIoTests } from "./utils/iFileIoTests.js";

describe('fileIoNode test', () => {
    

    iFileIoTests(fileIoNode, 'IFileIo');
})