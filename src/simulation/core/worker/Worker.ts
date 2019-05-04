import { ctx, TILE_HEIGHT, TILE_WIDTH } from "../../../globals";
import { Area } from "../Area";
import { BuildingTileEntity } from "../entity/BuildingTileEntity";
import { Position } from "../Position";
import { IOutputStorageContainer } from "../storage/IOutputStorageContainer";
import { World } from "../World";
import { Storage } from "./../storage/Storage";
import { Behaviour } from "./Behaviour";
import { WorkerStorageDefinition } from "./WorkerStorageDefinition";

export class Worker implements IOutputStorageContainer {
    public readonly world: World;
    public position: Position;
    public behaviour: Behaviour;

    private readonly _owner: BuildingTileEntity;
    get owner(): BuildingTileEntity { return this._owner; }

    private readonly _storage: Storage;
    get outputStorage(): Storage { return this._storage; }

    public id: number;
    public color: any = "#000000";

    constructor(world: World, owner: BuildingTileEntity, x: number, y: number) {
        this._owner = owner;
        this.world = world;
        this.position = new Position(x, y);
        // this.behaviour = new Behaviour("idle", this);
        this._storage = new Storage(WorkerStorageDefinition.instance);
    }

    public findPath(source: Area, destination: Area): Position[] {
        return this.world.pathfinder.getShortestPathForWorker(this.position.x, this.position.y, source, destination);
    }

    public draw() {
        this.behaviour.draw();
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.position.x * TILE_WIDTH, this.position.y * TILE_HEIGHT, 4, 0, Math.PI * 2, false);
        ctx.fill();
        if (this.outputStorage.getItem(0) !== null && this.outputStorage.getAmount(0) > 0) {
            const item = this.world.getItem(this.outputStorage.getItem(0));
            item.draw(this.world, this.position.x, this.position.y);
        }
    }
}
