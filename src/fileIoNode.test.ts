import { existsSync } from "fs";
import { fileIoNode } from "./fileIoNode";
import { iFileIoTests } from "./utils/iFileIoTests";

describe('fileIoNode test', () => {
    

    iFileIoTests(fileIoNode);
})