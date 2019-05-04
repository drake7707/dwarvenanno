import { IMetadata } from "../metadata/IMetadata";
import { ProduceMetadata } from "../metadata/ProduceMetadata";
import { Size } from "../Size";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { World } from "../World";
import { TileEntity } from "./TileEntity";
import { TileEntityDefinition } from "./TileEntityDefinition";

export abstract class ProduceTileEntityDefinition extends TileEntityDefinition {
    protected producePeriodicity: number = 1000;

    public outputStorageDefinition: StorageContainerDefinition;
    public constructor(key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, public blocked: boolean = true, nrOfStorageSlots: number = 1, maxNrOfItems = 1) {
        super(key, size, sourceTilesetX, sourceTilesetY, blocked);
        this.outputStorageDefinition = new StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
    }
    public createMetadata(): IMetadata {
        return new ProduceMetadata(this.outputStorageDefinition);
    }
    public initializeEntity(world: World, entity: TileEntity) {
        const metadata = entity.getMetadata<ProduceMetadata>();
        metadata.outputStorage.onStorageChanged = (incoming) => this.onOutputStorageChanged(incoming, world, entity);
        this.scheduleProduce(world, entity);
    }
    private onOutputStorageChanged(incoming: boolean, world: World, entity: TileEntity) {
        if (!incoming) // stuff taken away, maybe we can produce again
            this.scheduleProduce(world, entity);
    }
    private scheduleProduce(world: World, entity: TileEntity) {
        if (!world.scheduler.isEntityActionScheduled("GENERATE_PRODUCE", entity)) {
            const produceAction = () => {
                const reschedule = this.onItemProduced(entity);
                if (reschedule)
                    this.scheduleProduce(world, entity);
            };
            world.scheduler.scheduleEntityAction("GENERATE_PRODUCE", entity, "generate produce for " + entity.definition.key + " " + entity.id, produceAction, this.producePeriodicity);
        }
    }
    public abstract onItemProduced(entity: TileEntity): boolean;

    public createInstance(world: World, x: number, y: number): TileEntity {
        return new  TileEntity(this, world, x, y);
    }
}
