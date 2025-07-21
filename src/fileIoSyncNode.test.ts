

import { fileIoSyncNode } from "./fileIoSyncNode.js";
import { iFileIoTests } from "./utils/iFileIoTests.js";

describe('fileIoNode test', () => {
    

    iFileIoTests(fileIoSyncNode);
})