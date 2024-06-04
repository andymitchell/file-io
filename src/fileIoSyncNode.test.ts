

import { fileIoSyncNode } from "./fileIoSyncNode";
import { iFileIoTests } from "./utils/iFileIoTests";

describe('fileIoNode test', () => {
    

    iFileIoTests(fileIoSyncNode);
})