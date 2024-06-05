// Run this in Terminal with `npm run test_cli:spawn_like_exec`

import { getPackageDirectoryForSelfInTesting } from "../directory-helpers/getPackageDirectory";
import { fileIoNode } from "../fileIoNode";
import { fileIoSyncNode } from "../fileIoSyncNode";
import { spawnLikeExec } from "./spawnLikeExec";

async function main() {
    const uri = `${getPackageDirectoryForSelfInTesting()}/test-assets/spawn-like-exec/interactive.sh`;
    fileIoSyncNode.chmod_file(uri, '755');
    
    /*
    spawnLikeExec(uri, (error, stdout) => {
        if( error ) {
            console.warn("\n\nERROR\n", error);
        } else {
            console.log("\n\nSUCCESS stdout:\n", stdout);
        }
    });
    */

    const stdout = await fileIoNode.execute_file(uri, true);
    console.log("\n\nSUCCESS stdout:\n", stdout);

}


main().catch((err) => {
    console.error(err);
    console.warn("\n\nUNCAUGHT ERROR\n", err);
});
