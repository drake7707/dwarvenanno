import { ConsumeBuildingTileEntityDefinition } from "../core/entity/ConsumeBuildingTileEntityDefinition";

import { BuildingTileEntity } from "../core/entity/BuildingTileEntity";
import { ConsumeMetadata } from "../core/metadata/ConsumeMetadata";
import { Size } from "../core/Size";

export class HousePlotTileEntityDefinition extends ConsumeBuildingTileEntityDefinition {

    private readonly requiredWoodForHouseUpgrade: number = 10;
    private readonly requiredBreadForHouseUpgrade: number = 5;

    constructor() {
        super("houseplot", new Size(2, 2), 16, 2, ["wood", "bread"], true, 1, 2, 10);
        this.scanTargetPeriodicity = 5000;
        this.treshholdForItemsToFetch.put("wood", this.requiredWoodForHouseUpgrade);
        this.treshholdForItemsToFetch.put("bread", this.requiredBreadForHouseUpgrade);
    }

    public onConsume(entity: BuildingTileEntity): boolean {
        const metadata = entity.getMetadata<ConsumeMetadata>();

        if (metadata.inputStorage.canRemove("wood", this.requiredWoodForHouseUpgrade) &&
            metadata.inputStorage.canRemove("bread", this.requiredBreadForHouseUpgrade)) {
            // we have enough wood & bread for upgrading to a house
            const world = entity.workers[0].world;
            world.removeEntity(entity);
            const newDef = world.getTileEntityDefinition("house");
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
