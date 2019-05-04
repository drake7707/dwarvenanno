import { Worker } from "../worker/Worker";
import { World } from "../World";
import { BuildingTileEntityDefinition } from "./BuildingTileEntityDefinition";
import { TileEntity } from "./TileEntity";

export class BuildingTileEntity extends TileEntity {

    public constructor(definition: BuildingTileEntityDefinition, world: World, x: number, y: number) {
        super(definition, world, x, y);
        this.createWorkers(definition, world);
    }

    private _workers: Worker[];
    get workers(): Worker[] {
        return this._workers;
    }

    protected createWorkers(definition: BuildingTileEntityDefinition, world: World) {
        if (definition.availableNrOfWorkers > 0) {
            this._workers = [];
            for (let i: number = 0; i < definition.availableNrOfWorkers; i++) {
                this._workers[i] = new Worker(world, this, this.position.x + definition.size.width / 2, this.position.y + definition.size.height / 2);
                this._workers[i].id = i;
            }
        }
    }

    public drawWorkers() {
        for (const worker of this._workers) {
            worker.draw();
        }
    }
    public update(world: World, timePassed: number) {
        super.update(world, timePassed);
        // update workers
        for (const worker of this._workers) {
            worker.behaviour.update(timePassed);
        }
    }
}
