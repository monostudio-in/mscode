import { VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { IWorkingCopyBackupMeta } from "./workingCopy.js";
/**
 * A resolved working copy backup carries the backup value
 * as well as associated metadata with it.
 */
export interface IResolvedWorkingCopyBackup<T extends IWorkingCopyBackupMeta> {
    /**
     * The content of the working copy backup.
     */
    readonly value: VSBufferReadableStream;
    /**
     * Additional metadata that is associated with
     * the working copy backup.
     */
    readonly meta?: T;
}
