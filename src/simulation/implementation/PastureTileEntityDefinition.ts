import { ProduceTileEntityDefinition } from "../core/entity/ProduceTileEntityDefinition";
import { TileEntity } from "../core/entity/TileEntity";
import { IUpkeepCost } from "../core/IUpkeepCost";
import { ProduceMetadata } from "../core/metadata/ProduceMetadata";
import { Size } from "../core/Size";

export class PastureTileEntityDefinition extends ProduceTileEntityDefinition implements IUpkeepCost {

    public upkeepCost: number = 10;

    public constructor() {
        super("pasture", new Size(2, 2), 28, 2, true, 2, 5);
        this.producePeriodicity = 10000;
    }

    public onItemProduced(entity: TileEntity): boolean {
        const metadata = entity.getMetadata<ProduceMetadata>();
        const result = metadata.outputStorage.add("cow", 1);
        return result.actualAmount > 0; // stop production as soon as we can't produce anymore
    }
}
