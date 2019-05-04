import { IInputStorageContainer } from "../storage/IInputStorageContainer";
import { Storage } from "../storage/Storage";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { CachedTargetsMetadata } from "./CachedTargetsMetadata";

export class ConsumeMetadata extends CachedTargetsMetadata implements IInputStorageContainer {

    private readonly _inputStorage: Storage;
    get inputStorage(): Storage {
        return this._inputStorage;
    }

    constructor(storageDefinition: StorageContainerDefinition) {
        super();
        this._inputStorage = new Storage(storageDefinition);
    }
}
