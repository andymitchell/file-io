import { fileIoNode } from './old/fileIoNode.ts';
import { fileIoSyncNode } from './old/fileIoSyncNode.ts';
import type { IFileIo, IFileIoSync } from './old/types.ts';

export {
    fileIoNode,
    fileIoSyncNode
}

export type {
    IFileIo,
    IFileIoSync
}

export * from './old/user-input/index.ts';
export * from './old/directory-helpers/index.ts';
export * from './old/file-helpers/index.ts';

