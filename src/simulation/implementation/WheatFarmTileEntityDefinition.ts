import { ProductionBuildingTileEntityDefinition } from "../core/entity/ProductionBuildingTileEntityDefinition";
import { Size } from "../core/Size";

export class WheatFarmTileEntityDefinition extends ProductionBuildingTileEntityDefinition {

    public upkeepCost: number = 10;

    public constructor() {
        super("wheatfarm", new Size(2, 2), 10, 2, ["wheat"], true, 1, 1, 40);
        this.scanTargetPeriodicity = 5000;
    }
}
