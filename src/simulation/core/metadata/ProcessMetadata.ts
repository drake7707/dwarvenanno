import { IInputStorageContainer } from "../storage/IInputStorageContainer";
import { IOutputStorageContainer } from "../storage/IOutputStorageContainer";
import { Storage } from "../storage/Storage";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { CachedTargetsMetadata } from "./CachedTargetsMetadata";

export class ProcessMetadata extends CachedTargetsMetadata implements IOutputStorageContainer, IInputStorageContainer {

    private readonly _outputStorage: Storage;
    get outputStorage(): Storage {
        return this._outputStorage;
    }

    private readonly _inputStorage: Storage;
    get inputStorage(): Storage {
        return this._inputStorage;
    }

    constructor(inputStorageDefinition: StorageContainerDefinition, outputStorageDefinition: StorageContainerDefinition) {
        super();
        this._inputStorage = new Storage(inputStorageDefinition);
        this._outputStorage = new Storage(outputStorageDefinition);
    }
}
