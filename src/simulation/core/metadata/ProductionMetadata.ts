import { IOutputStorageContainer } from "../storage/IOutputStorageContainer";
import { Storage } from "../storage/Storage";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { CachedTargetsMetadata } from "./CachedTargetsMetadata";
export class ProductionMetadata extends CachedTargetsMetadata implements IOutputStorageContainer {

    private readonly _outputStorage: Storage;
    get outputStorage(): Storage {
        return this._outputStorage;
    }

    constructor(storageDefinition: StorageContainerDefinition) {
        super();
        this._outputStorage = new Storage(storageDefinition);
    }
}
