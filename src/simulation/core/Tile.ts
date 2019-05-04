import { TileEntity } from "./entity/TileEntity";
import { TileModifierFlags } from "./TileModifierFlags";
import { World } from "./World";

export class Tile {
    constructor(public definitionIndex: number, public entity: TileEntity = null) {
    }

    public isBlocked(world: World): boolean {
        const def = world.getTileDefinition(this.definitionIndex);
        if ((def.flags & TileModifierFlags.Blocked) === TileModifierFlags.Blocked)
            return true;
        if (this.entity !== null) {
            return this.entity.isBlocked(world);
        }
        return false;
    }
    public draw(world: World, x: number, y: number) {
        const def = world.getTileDefinition(this.definitionIndex);
        def.draw(this.definitionIndex, x, y);
    }
}
