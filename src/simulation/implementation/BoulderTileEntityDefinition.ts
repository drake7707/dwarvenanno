import { Size } from "../core/Size";

import { ProduceTileEntityDefinition } from "../core/entity/ProduceTileEntityDefinition";
import { TileEntity } from "../core/entity/TileEntity";
import { ProduceMetadata } from "../core/metadata/ProduceMetadata";

export class BoulderTileEntityDefinition extends ProduceTileEntityDefinition {

    public constructor() {
        super("boulder", new Size(2, 2), 24, 2, true, 1, 5);
        this.producePeriodicity = 10000;
    }

    public onItemProduced(entity: TileEntity): boolean {
        const metadata = entity.getMetadata<ProduceMetadata>();
        const result = metadata.outputStorage.add("stone", 1);
        return result.actualAmount > 0; // stop production as soon as we can't produce anymore
    }
}
