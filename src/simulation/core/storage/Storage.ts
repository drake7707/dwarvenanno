import { Map } from "../../../datastructs/Map";
import { StorageContainerDefinition } from "./StorageContainerDefinition";
import { StorageModificationResult } from "./StorageModificationResult";

export class Storage {
    private readonly itemKeys: string[];
    private readonly itemAmount: number[];

    private readonly _definition: StorageContainerDefinition;

    public storageChanged: (incoming: boolean) => void;

    get definition(): StorageContainerDefinition { return this._definition; }

    public constructor(storageContainerDefinition: StorageContainerDefinition) {
        this._definition = storageContainerDefinition;

        this.itemKeys = new Array(storageContainerDefinition.nrOfStorageSlots);
        this.itemAmount = new Array(storageContainerDefinition.nrOfStorageSlots);
        this.surpressStorageChanged = true;
        this.clear();
        this.surpressStorageChanged = false;
    }

    get isEmpty(): boolean {
        for (let i: number = 0; i < this.definition.nrOfStorageSlots; i++) {
            if (this.getItem(i) !== null)
                return false;
        }
        return true;
    }

    public getItem(slot: number): string {
        return this.itemKeys[slot];
    }
    public getAmount(slot: number): number {
        return this.itemAmount[slot];
    }

    public getTotalAmountOf(key: string): number {
        let total = 0;
        for (let i: number = 0; i < this._definition.nrOfStorageSlots; i++) {
            if (this.getItem(i) === key)
                total += this.getAmount(i);
        }
        return total;
    }

    public canAdd(key: string, amount: number): boolean {
        return this.add(key, amount, true).actualAmount > 0;
    }

    public add(key: string, amount: number, checkOnly: boolean = false): StorageModificationResult {
        let actualAmountStored = 0;

        // first fill all slots of that item to max
        for (let i: number = 0; i < this._definition.nrOfStorageSlots; i++) {
            if (this.itemKeys[i] === key) {
                const amountToStore = amount - actualAmountStored;
                if (this.itemAmount[i] + amountToStore <= this._definition.maxNrOfItems) {
                    if (!checkOnly)
                        this.itemAmount[i] += amountToStore;
                    actualAmountStored += amountToStore;

                    if (!checkOnly && actualAmountStored > 0)
                        this.onStorageChanged(true, key, actualAmountStored);

                    return new StorageModificationResult(actualAmountStored);
                } else {
                    // doesn't fit completely
                    const remainder = this._definition.maxNrOfItems - this.itemAmount[i];
                    if (!checkOnly)
                        this.itemAmount[i] += remainder;
                    actualAmountStored += remainder;
                }
            }
        }

        if (actualAmountStored < amount) {
            // look for empty slots and fill up
            for (let i: number = 0; i < this._definition.nrOfStorageSlots; i++) {
                if (this.itemKeys[i] === null) {
                    if (!checkOnly)
                        this.itemKeys[i] = key;
                    const amountToStore = amount - actualAmountStored;

                    if (this.itemAmount[i] + amountToStore <= this._definition.maxNrOfItems) {
                        if (!checkOnly)
                            this.itemAmount[i] += amountToStore;
                        actualAmountStored += amountToStore;

                        if (!checkOnly && actualAmountStored > 0)
                            this.onStorageChanged(true, key, actualAmountStored);
                        return new StorageModificationResult(actualAmountStored);
                    } else {
                        // doesn't fit completely
                        const remainder = this._definition.maxNrOfItems - this.itemAmount[i];
                        if (!checkOnly)
                            this.itemAmount[i] += remainder;
                        actualAmountStored += remainder;
                    }
                }
            }
        }
        if (!checkOnly && actualAmountStored > 0)
            this.onStorageChanged(true, key, actualAmountStored);

        // yeah whatever, not enough room, we stored it to the brim
        return new StorageModificationResult(actualAmountStored);
    }

    public clear() {
        for (let i: number = 0; i < this._definition.nrOfStorageSlots; i++) {
            this.itemKeys[i] = null;
            this.itemAmount[i] = 0;
        }

        this.onStorageChanged(false, null, 0);
    }

    public canRemove(key: string, amount: number): boolean {
        const actualAmount = this.remove(key, amount, true).actualAmount;
        return actualAmount >= amount;
    }

    public remove(key: string, amount: number, checkOnly: boolean = false): StorageModificationResult {
        let actualAmountRetrieved = 0;
        for (let i: number = 0; i < this._definition.nrOfStorageSlots; i++) {
            if (this.itemKeys[i] === key) {
                if (actualAmountRetrieved + this.itemAmount[i] <= amount) {
                    actualAmountRetrieved += this.itemAmount[i];
                    if (!checkOnly) {
                        this.itemAmount[i] = 0;
                        this.itemKeys[i] = null;
                    }
                } else {
                    // take the remainder out of slot i
                    const remainder = amount - actualAmountRetrieved;
                    if (!checkOnly)
                        this.itemAmount[i] -= remainder;
                    // no need to go any further, the amount is reached
                    actualAmountRetrieved += remainder;

                    if (!checkOnly && actualAmountRetrieved > 0)
                        this.onStorageChanged(false, key, actualAmountRetrieved);

                    return new StorageModificationResult(actualAmountRetrieved);
                }
            }
        }
        if (!checkOnly && actualAmountRetrieved > 0)
            this.onStorageChanged(false, key, actualAmountRetrieved);
        // not the full requested amount was able to be retrieved
        return new StorageModificationResult(actualAmountRetrieved);
    }

    public transferFrom(sourceStorage: Storage) {
        for (let i: number = 0; i < sourceStorage.definition.nrOfStorageSlots; i++) {
            this.transferItemFrom(sourceStorage, sourceStorage.getItem(i), sourceStorage.getAmount(i));
        }
        this.optimize();
    }

    public transferItemFrom(sourceStorage: Storage, key: string, maxAmount: number = Number.MAX_VALUE): number {

        const removeResult = sourceStorage.remove(key, maxAmount, true);
        // check for available items in source storage
        if (removeResult.actualAmount === 0)
            return 0;

        const addResult = this.add(key, removeResult.actualAmount, true);

        // check for no room in current storage
        if (addResult.actualAmount === 0)
            return 0;

        const amountAbleToTransfer = addResult.actualAmount;

        if (amountAbleToTransfer === 0)
            return 0;

        sourceStorage.remove(key, amountAbleToTransfer);
        this.add(key, amountAbleToTransfer);

        this.optimize();
        return amountAbleToTransfer;
    }

    private surpressStorageChanged: boolean = false;
    public onStorageChanged(incoming: boolean, item: string, amount: number) {
        if (this.surpressStorageChanged) return;

        if (typeof this.storageChanged !== "undefined" && this.storageChanged !== null) {
            this.storageChanged(incoming);
        }
    }

    public optimize() {
        this.surpressStorageChanged = true;
        try {
            const allItems = new Map<number>();
            for (let i: number = 0; i < this.definition.nrOfStorageSlots; i++) {
                if (!allItems.containsKey(this.getItem(i)))
                    allItems.put(this.getItem(i), this.getAmount(i));
                else
                    allItems.put(this.getItem(i), allItems.get(this.getItem(i)) + this.getAmount(i));
            }
            this.clear();

            for (const key of allItems.getKeys()) {
                this.add(key, allItems.get(key));
            }
        } finally {
            this.surpressStorageChanged = false;
        }
    }
}
