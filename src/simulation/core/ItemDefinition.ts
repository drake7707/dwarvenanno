import { ctx, img, TILE_HEIGHT, TILE_WIDTH } from "../../globals";
import { Position } from "./Position";
import { World } from "./World";

export class ItemDefinition {

    private readonly sourceTilesetPosition: Position;

    public constructor(public key: string, sourceTilesetX: number, sourceTilesetY: number) {
        this.sourceTilesetPosition = new Position(sourceTilesetX, sourceTilesetY);
    }

    public draw(world: World, x: number, y: number) {
        ctx.drawImage(img, this.sourceTilesetPosition.x * TILE_WIDTH, this.sourceTilesetPosition.y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, x * TILE_WIDTH - TILE_WIDTH / 2, y * TILE_HEIGHT - TILE_HEIGHT / 2, TILE_WIDTH, TILE_HEIGHT);
    }
}
