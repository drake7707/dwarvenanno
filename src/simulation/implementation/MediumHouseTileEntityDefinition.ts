import { BuildingTileEntity } from "../core/entity/BuildingTileEntity";
import { ConsumeBuildingTileEntityDefinition } from "../core/entity/ConsumeBuildingTileEntityDefinition";
import { TileEntity } from "../core/entity/TileEntity";
import { Size } from "../core/Size";
import { IInputStorageContainer } from "../core/storage/IInputStorageContainer";
import { World } from "../core/World";

export class MediumHouseTileEntityDefinition extends ConsumeBuildingTileEntityDefinition {

    private readonly consumeBreadPeriodicity: number = 60000;
    private readonly consumeBeefPeriodicity: number = 60000;
    private readonly consumeWoodPeriodicity: number = 120000;
    private readonly consumeClothesPeriodicity: number = 120000;
    public taxAmount: number = 100;

    constructor() {
        super("mediumhouse", new Size(2, 2), 20, 2, ["wood", "bread", "beef", "clothes"], true, 1, 4, 20);
        this.scanTargetPeriodicity = 5000;
        this.treshholdForItemsToFetch.put("wood", 20);
        this.treshholdForItemsToFetch.put("bread", 20);
        this.treshholdForItemsToFetch.put("beef", 20);
        this.treshholdForItemsToFetch.put("clothes", 20);
    }

    public initializeEntity(world: World, entity: TileEntity) {
        super.initializeEntity(world, entity);
        this.scheduleConsumeBread(world, <BuildingTileEntity>entity);
        this.scheduleConsumeWood(world, <BuildingTileEntity>entity);
        this.scheduleConsumeBeef(world, <BuildingTileEntity>entity);
        this.scheduleConsumeClothes(world, <BuildingTileEntity>entity);
    }

    private scheduleConsumeWood(world: World, entity: BuildingTileEntity) {
        const consumeWoodAction = () => {
            const metadata = entity.getMetadata<IInputStorageContainer>();
            if (metadata.inputStorage.canRemove("wood", 1)) {
                metadata.inputStorage.remove("wood", 1);
                this.scheduleConsumeWood(world, entity);
            } else {
                // devolve
                this.devolveToHouse(entity);
            }
        };
        world.scheduler.scheduleEntityAction("CONSUME_WOOD", entity, "Consume wood", consumeWoodAction, this.consumeWoodPeriodicity);
    }

    private scheduleConsumeBread(world: World, entity: BuildingTileEntity) {
        const consumeBreadAction = () => {
            const metadata = entity.getMetadata<IInputStorageContainer>();
            if (metadata.inputStorage.canRemove("bread", 1)) {
                metadata.inputStorage.remove("bread", 1);
                this.scheduleConsumeBread(world, entity);
            } else {
                // devolve
                this.devolveToHouse(entity);
            }
        };
        world.scheduler.scheduleEntityAction("CONSUME_BREAD", entity, "Consume bread", consumeBreadAction, this.consumeBreadPeriodicity);
    }

    private scheduleConsumeBeef(world: World, entity: BuildingTileEntity) {
        const consumeBeefAction = () => {
            const metadata = entity.getMetadata<IInputStorageContainer>();
            if (metadata.inputStorage.canRemove("beef", 1)) {
                metadata.inputStorage.remove("beef", 1);
                this.scheduleConsumeBeef(world, entity);
            } else {
                // devolve
                this.devolveToHouse(entity);
            }
        };
        world.scheduler.scheduleEntityAction("CONSUME_BEEF", entity, "Consume beef", consumeBeefAction, this.consumeBeefPeriodicity);
    }

    private scheduleConsumeClothes(world: World, entity: BuildingTileEntity) {
        const consumeClothesAction = () => {
            const metadata = entity.getMetadata<IInputStorageContainer>();
            if (metadata.inputStorage.canRemove("clothes", 1)) {
                metadata.inputStorage.remove("clothes", 1);
                this.scheduleConsumeClothes(world, entity);
            } else {
                // devolve
                this.devolveToHouse(entity);
            }
        };
        world.scheduler.scheduleEntityAction("CONSUME_CLOTHES", entity, "Consume clothes", consumeClothesAction, this.consumeClothesPeriodicity);
    }

    private devolveToHouse(entity: BuildingTileEntity) {
        const world = entity.workers[0].world;
        world.removeEntity(entity);

        const newDef = world.getTileEntityDefinition("house");
        const area = entity.getArea();
        const instance = <BuildingTileEntity>newDef.createInstance(world, area.position.x, area.position.y);
        const metadata = entity.getMetadata<IInputStorageContainer>();
        const instanceMetadata = instance.getMetadata<IInputStorageContainer>();

        // move the current storage to the new instance
        instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "wood", 10); // MAX ITEMS of wood TODO
        instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "bread", 10); // MAX ITEMS of bread TODO
        instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "clothes", 10); // MAX ITEMS of bread TODO
        instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "beef", 10); // MAX ITEMS of bread TODO
        instanceMetadata.inputStorage.optimize();
        world.placeEntity(instance);
    }

    public onConsume(entity: BuildingTileEntity): boolean {
        return false;
    }
}
