import { ctx, img, TILE_HEIGHT, TILE_WIDTH } from "../../globals";
import { ProduceTileEntityDefinition } from "../core/entity/ProduceTileEntityDefinition";
import { TileEntity } from "../core/entity/TileEntity";
import { IUpkeepCost } from "../core/IUpkeepCost";
import { ProduceMetadata } from "../core/metadata/ProduceMetadata";
import { Size } from "../core/Size";
import { World } from "../core/World";

export class WheatFarmPlotTileEntityDefinition extends ProduceTileEntityDefinition implements IUpkeepCost {

    public upkeepCost: number = 5;

    public constructor() {
        super("wheatfarmplot", new Size(2, 2), 6, 2, true, 1, 5);
        this.producePeriodicity = 2000;
    }

    public onItemProduced(entity: TileEntity): boolean {
        const metadata = entity.getMetadata<ProduceMetadata>();
        const result = metadata.outputStorage.add("wheat", 1);
        return result.actualAmount > 0; // stop production as soon as we can't produce anymore
    }

    public draw(world: World, entity: TileEntity, x: number, y: number) {
        super.draw(world, entity, x, y);
        const metadata = entity.getMetadata<ProduceMetadata>();
        const percFull = metadata.outputStorage.getTotalAmountOf("wheat") / 5;
        ctx.globalAlpha = percFull;
        ctx.drawImage(img, (this.sourceTilesetPosition.x + 2) * TILE_WIDTH, this.sourceTilesetPosition.y * TILE_HEIGHT, this.size.width * TILE_WIDTH, this.size.height * TILE_HEIGHT, x * TILE_WIDTH, y * TILE_HEIGHT, this.size.width * TILE_WIDTH, this.size.height * TILE_HEIGHT);
        ctx.globalAlpha = 1;
    }
}
