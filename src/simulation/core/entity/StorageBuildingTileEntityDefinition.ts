import { IMetadata } from "../metadata/IMetadata";
import { StorageMetadata } from "../metadata/StorageMetadata";
import { Size } from "../Size";
import { IOutputStorageContainer } from "../storage/IOutputStorageContainer";
import { Storage } from "../storage/Storage";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { World } from "../World";
import { BuildingTileEntity } from "./BuildingTileEntity";
import { FetchItemBuildingTileEntityDefinition } from "./FetchItemBuildingTileEntityDefinition";
import { TileEntity } from "./TileEntity";

export class StorageBuildingTileEntityDefinition extends FetchItemBuildingTileEntityDefinition {

    public outputStorageDefinition: StorageContainerDefinition;

    public constructor(key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, itemsToStore: string[], blocked: boolean = true, availableNrOfWorkers: number = 0, nrOfStorageSlots: number = 1, maxNrOfItems: number = 1) {
        super(key, size, sourceTilesetX, sourceTilesetY, itemsToStore, blocked, availableNrOfWorkers);
        this.outputStorageDefinition = new StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
        for (const item of itemsToStore) {
            // have 5 items as buffer, so when multiple workers arrive at the same time, they can go over the treshold a bit
            // so they don't get stuck waiting till there is room to drop items off
            this.treshholdForItemsToFetch.put(item, maxNrOfItems - 5);
        }
    }

    public createMetadata(): IMetadata {
        return new StorageMetadata(this.outputStorageDefinition);
    }

    public createInstance(world: World, x: number, y: number): TileEntity {
        const b = new BuildingTileEntity(this, world, x, y);
        for (const w of b.workers)
            w.color = "#0000FF";
        return b;
    }
    
    protected getTargetStorageForDropOff(entity: TileEntity): Storage {
        const metadata = entity.getMetadata<IOutputStorageContainer>();
        return metadata.outputStorage;
    }
}
