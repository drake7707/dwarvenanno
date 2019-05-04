import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";

export class WorkerStorageDefinition extends StorageContainerDefinition {
    public constructor() {
        super(1, 5);
    }
    public static instance = new WorkerStorageDefinition();
}
