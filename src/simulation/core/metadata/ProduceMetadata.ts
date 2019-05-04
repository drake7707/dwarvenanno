import { IOutputStorageContainer } from "../storage/IOutputStorageContainer";
import { Storage } from "../storage/Storage";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { IMetadata } from "./IMetadata";

export class ProduceMetadata implements IMetadata, IOutputStorageContainer {

    private readonly _outputStorage: Storage;
    get outputStorage(): Storage {
        return this._outputStorage;
    }

    constructor(storageDefinition: StorageContainerDefinition) {
        this._outputStorage = new Storage(storageDefinition);
    }
}
