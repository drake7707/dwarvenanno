import { ConsumeBuildingTileEntityDefinition } from "../core/entity/ConsumeBuildingTileEntityDefinition";

import { TileEntity } from "../core/entity/TileEntity";

import { BuildingTileEntity } from "../core/entity/BuildingTileEntity";
import { ITaxProfit } from "../core/ITaxProfit";
import { ConsumeMetadata } from "../core/metadata/ConsumeMetadata";
import { Size } from "../core/Size";
import { IInputStorageContainer } from "../core/storage/IInputStorageContainer";
import { World } from "../core/World";

export class HouseTileEntityDefinition extends ConsumeBuildingTileEntityDefinition implements ITaxProfit {
    private readonly consumeBreadPeriodicity: number = 60000;
    private readonly consumeWoodPeriodicity: number = 120000;
    private readonly requiredBeefForHouseUpgrade: number = 5;
    private readonly requiredClothesForHouseUpgrade: number = 5;

    public taxAmount: number = 30;

    constructor() {
        super("house", new Size(2, 2), 18, 2, ["wood", "bread", "beef", "clothes"], true, 1, 4, 10);
        this.scanTargetPeriodicity = 5000;
        this.treshholdForItemsToFetch.put("wood", 10);
        this.treshholdForItemsToFetch.put("bread", 10);
        this.treshholdForItemsToFetch.put("beef", 10);
        this.treshholdForItemsToFetch.put("clothes", 10);
    }

    public initializeEntity(world: World, entity: TileEntity) {
        super.initializeEntity(world, entity);
        this.scheduleConsumeBread(world, <BuildingTileEntity>entity);
        this.scheduleConsumeWood(world, <BuildingTileEntity>entity);
    }

    private scheduleConsumeWood(world: World, entity: BuildingTileEntity) {
        const consumeWoodAction = () => {
            const metadata = entity.getMetadata<IInputStorageContainer>();
            if (metadata.inputStorage.canRemove("wood", 1)) {
                metadata.inputStorage.remove("wood", 1);
                this.scheduleConsumeWood(world, entity);
            } else {
                // devolve
                this.devolveToHousePlot(entity);
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
                this.devolveToHousePlot(entity);
            }
        };
        world.scheduler.scheduleEntityAction("CONSUME_BREAD", entity, "Consume bread", consumeBreadAction, this.consumeBreadPeriodicity);
    }

    private devolveToHousePlot(entity: BuildingTileEntity) {
        const world = entity.workers[0].world;
        world.removeEntity(entity);
        const newDef = world.getTileEntityDefinition("houseplot");
        const area = entity.getArea();
        const instance = <BuildingTileEntity>newDef.createInstance(world, area.position.x, area.position.y);
        const metadata = entity.getMetadata<IInputStorageContainer>();
        const instanceMetadata = instance.getMetadata<IInputStorageContainer>();

        // move the current storage to the new instance
        // remove all items that are not applicable to houseplot
        instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "wood", 10); // MAX ITEMS of wood TODO
        instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "bread", 10); // MAX ITEMS of bread TODO
        instanceMetadata.inputStorage.remove("beef", instanceMetadata.inputStorage.getTotalAmountOf("beef"));
        instanceMetadata.inputStorage.remove("clothes", instanceMetadata.inputStorage.getTotalAmountOf("clothes"));
        instanceMetadata.inputStorage.optimize();

        world.placeEntity(instance);
    }

    public onConsume(entity: BuildingTileEntity): boolean {
        const metadata = entity.getMetadata<ConsumeMetadata>();
        if (metadata.inputStorage.canRemove("beef", this.requiredBeefForHouseUpgrade) &&
            metadata.inputStorage.canRemove("clothes", this.requiredClothesForHouseUpgrade)) {
            // we have enough  buffer for upgrading to a medium house
            const world = entity.workers[0].world;
            world.removeEntity(entity);

            const newDef = world.getTileEntityDefinition("mediumhouse");
            const area = entity.getArea();
            const instance = <BuildingTileEntity>newDef.createInstance(world, area.position.x, area.position.y);
            const instanceMetadata = instance.getMetadata<ConsumeMetadata>();

            // move the current storage to the new instance
            instanceMetadata.inputStorage.transferFrom(metadata.inputStorage);
            world.placeEntity(instance);
            return false; // EOL on this entity so don't reschedule
        }
        return true;
    }
}
