import { DEBUG } from "../../../globals";
import { ConsumeMetadata } from "../metadata/ConsumeMetadata";
import { IMetadata } from "../metadata/IMetadata";
import { Size } from "../Size";
import { IInputStorageContainer } from "../storage/IInputStorageContainer";
import { Storage } from "../storage/Storage";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { World } from "../World";
import { BuildingTileEntity } from "./BuildingTileEntity";
import { FetchItemBuildingTileEntityDefinition } from "./FetchItemBuildingTileEntityDefinition";
import { TileEntity } from "./TileEntity";

export abstract class ConsumeBuildingTileEntityDefinition extends FetchItemBuildingTileEntityDefinition {

    protected consumePeriodicity: number = 1000;

    public inputStorageDefinition: StorageContainerDefinition;

    public constructor(key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, consumedItems: string[],
        blocked: boolean = true, availableNrOfWorkers: number = 0, nrOfStorageSlots: number = 1, maxNrOfItems: number = 1) {
        super(key, size, sourceTilesetX, sourceTilesetY, consumedItems, blocked, availableNrOfWorkers);
        this.inputStorageDefinition = new StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
    }

    public createInstance(world: World, x: number, y: number): TileEntity {
        return new BuildingTileEntity(this, world, x, y);
    }

    public createMetadata(): IMetadata {
        return new ConsumeMetadata(this.inputStorageDefinition);
    }

    protected getTargetStorageForDropOff(entity: TileEntity): Storage {
        return entity.getMetadata<IInputStorageContainer>().inputStorage;
    }

    public initializeEntity(world: World, entity: TileEntity) {
        super.initializeEntity(world, entity);
        this.scheduleConsume(world, entity);
    }

    public abstract onConsume(entity: BuildingTileEntity): boolean;

    private scheduleConsume(world: World, entity: TileEntity) {
        const consumeAction = () => {
            const e = entity;
            const reschedule = this.onConsume(<BuildingTileEntity>entity);
            if (reschedule) {
                this.scheduleConsume(world, entity);
            } else {
                if (DEBUG)
                    console.log("CONSUMPTION FOR " + e.definition.key + " " + e.id + " IS NOT RESCHEDULED");
            }
        };
        world.scheduler.scheduleEntityAction("CONSUME", entity, "consumption for " + entity.definition.key + " " + entity.id, consumeAction, this.consumePeriodicity);
    }
}
