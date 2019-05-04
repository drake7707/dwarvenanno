import { ctx, img, TILE_HEIGHT, TILE_WIDTH } from "../../globals";
import { TileModifierFlags } from "./TileModifierFlags";

export class TileDefinition {

    constructor(public key: string, public flags: TileModifierFlags = TileModifierFlags.None, public speed: number = 2) {
    }

    public draw(idx: number, x: number, y: number) {
        ctx.beginPath();
        // ctx.fillStyle = this.color;
        // ctx.fillRect(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
        ctx.drawImage(img, idx * TILE_WIDTH, 0, TILE_WIDTH, TILE_HEIGHT, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
        ctx.fill();
    }
}
