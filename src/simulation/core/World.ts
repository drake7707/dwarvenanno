import { Map } from "../../datastructs/Map";
import { ctx, ctxOverlay, DEBUG, SHOW_RADII, TILE_HEIGHT, TILE_WIDTH } from "../../globals";
import { Area } from "./Area";
import { BuildingTileEntity } from "./entity/BuildingTileEntity";
import { TileEntity } from "./entity/TileEntity";
import { TileEntityDefinition } from "./entity/TileEntityDefinition";
import { ItemDefinition } from "./ItemDefinition";
import { Tile } from "./Tile";
import { TileDefinition } from "./TileDefinition";
import { WorldPathFinder } from "./WorldPathFinder";
import { WorldScheduler } from "./WorldScheduler";
import { WorldScoring } from "./WorldScoring";

export class World {

    private readonly _nrOfCols: number;
    get nrOfCols(): number { return this._nrOfCols; }

    private readonly _nrOfRows: number;
    get nrOfRows(): number { return this._nrOfRows; }

    // tileset
    private readonly tileset: TileDefinition[];
    private readonly tilesetIndices: Map<number>;

    // entity set
    private readonly entitySet: Map<TileEntityDefinition>;

    // item set
    private readonly itemSet: Map<ItemDefinition>;
    private readonly itemIndices: Map<number>;
    private readonly _tiles: Tile[][];
    get tiles(): Tile[][] { return this._tiles; }

    private readonly _entities: TileEntity[];
    get entities(): TileEntity[] { return this._entities; }

    private readonly _scheduler: WorldScheduler;
    get scheduler(): WorldScheduler { return this._scheduler; }

    private readonly _pathfinder: WorldPathFinder;
    get pathfinder(): WorldPathFinder { return this._pathfinder; }

    private readonly _scoring: WorldScoring;
    get scoring(): WorldScoring { return this._scoring; }

    constructor(nrOfCols: number, nrOfRows: number, tileset: TileDefinition[], entitySet: TileEntityDefinition[], tiles: Tile[][], entities: TileEntity[], itemSet: ItemDefinition[]) {
        this._nrOfCols = nrOfCols;
        this._nrOfRows = nrOfRows;
        this.tileset = tileset;
        this.tilesetIndices = new Map<number>();

        for (let i: number = 0; i < tileset.length; i++)
            this.tilesetIndices.put(tileset[i].key, i);

        this.entitySet = new Map<TileEntityDefinition>();

        for (const eDef of entitySet)
            this.entitySet.put(eDef.key, eDef);
        this.itemSet = new Map<ItemDefinition>();

        for (const itemDef of itemSet)
            this.itemSet.put(itemDef.key, itemDef);

        this._entities = entities;
        this._tiles = tiles;
        this._scheduler = new WorldScheduler(this);
        this._pathfinder = new WorldPathFinder(this);
        this._scoring = new WorldScoring(this);
    }

    public draw() {
        this.drawGrid();
        for (let j: number = 0; j < this._nrOfRows; j++) {
            for (let i: number = 0; i < this._nrOfCols; i++) {
                this.tiles[i][j].draw(this, i, j);
            }
        }
        for (const entity of this._entities) {
            entity.draw(this);
            if (entity instanceof BuildingTileEntity) {
                entity.drawWorkers();
            }
        }
    }

    private drawGrid() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";
        ctx.beginPath();
        for (let j: number = 0; j <= this._nrOfRows; j++) {
            ctx.moveTo(0.5, Math.floor(j * TILE_HEIGHT) + 0.5);
            ctx.lineTo(Math.floor(this._nrOfCols * TILE_WIDTH) + 0.5, Math.floor(j * TILE_HEIGHT) + 0.5);
        }
        for (let i: number = 0; i <= this._nrOfCols; i++) {
            ctx.moveTo(Math.floor(i * TILE_WIDTH) + 0.5, 0.5);
            ctx.lineTo(Math.floor(i * TILE_WIDTH) + 0.5, Math.floor(this._nrOfRows * TILE_HEIGHT) + 0.5);
        }
        ctx.stroke();
    }

    // tiles
    public getTile(x: number, y: number): Tile {
        return this.tiles[Math.floor(x)][Math.floor(y)];
    }

    public getTileDefinition(definitionIndex: number): TileDefinition {
        return this.tileset[definitionIndex];
    }

    public getTilesAround(from: Area, radius: number, action: (x: number, y: number) => boolean) {
        const l = from.position.x;
        const r = from.position.x + from.size.width - 1;
        const t = from.position.y;
        const b = from.position.y + from.size.height - 1;
        let curX = l;
        let curY = t - 1;
        let curRadius = 0;
        while (curRadius < radius) {
            const edgeWidth = 1 + 2 * curRadius;
            for (let i: number = l; i <= r + edgeWidth; i++) {
                if (this.isValidTile(curX, curY)) {
                    if (SHOW_RADII) {
                        ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                        ctxOverlay.fillRect(curX * TILE_WIDTH, curY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                    }
                    const cont = action(curX, curY);
                    if (!cont)
                        return;
                }
                curX++;
            }
            curX--;
            curY++;
            for (let i: number = t; i <= b + edgeWidth; i++) {
                if (this.isValidTile(curX, curY)) {
                    if (SHOW_RADII) {
                        ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                        ctxOverlay.fillRect(curX * TILE_WIDTH, curY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                    }
                    const cont = action(curX, curY);
                    if (!cont)
                        return;
                }
                curY++;
            }
            curY--;
            curX--;
            for (let i: number = r; i >= l - edgeWidth; i--) {
                if (this.isValidTile(curX, curY)) {
                    if (SHOW_RADII) {
                        ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                        ctxOverlay.fillRect(curX * TILE_WIDTH, curY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                    }
                    const cont = action(curX, curY);
                    if (!cont)
                        return;
                }
                curX--;
            }
            curX++;
            curY--;
            for (let i: number = b; i >= t - edgeWidth; i--) {
                if (this.isValidTile(curX, curY)) {
                    if (SHOW_RADII) {
                        ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                        ctxOverlay.fillRect(curX * TILE_WIDTH, curY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                    }
                    const cont = action(curX, curY);
                    if (!cont)
                        return;
                }
                curY--;
            }
            curRadius++;
        }
    }

    public isValidTile(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this._nrOfCols && y < this._nrOfRows;
    }

    public isTileOfDefiniton(x: number, y: number, key: string) {
        if (!this.tilesetIndices.containsKey(key))
            throw new Error("The tile definition with key " + key + " doesn't exist in the tileset");
        return this.tiles[x][y].definitionIndex === this.tilesetIndices.get(key);
    }

    // tile entities
    public setTileDefinition(x: number, y: number, key: string) {
        if (!this.tilesetIndices.containsKey(key))
            throw new Error("The tile definition with key " + key + " doesn't exist in the tileset");
        this.tiles[x][y].definitionIndex = this.tilesetIndices.get(key);
    }

    public canPlaceEntity(entity: TileEntity): boolean {
        const area = entity.getArea();
        for (let j: number = area.position.y; j < area.position.y + area.size.height; j++) {
            for (let i: number = area.position.x; i < area.position.x + area.size.width; i++) {
                if (!this.isValidTile(i, j) || this.tiles[i][j].isBlocked(this))
                    return false;
            }
        }
        return true;
    }

    private newEntityId = 1;
    public placeEntity(entity: TileEntity) {
        this._entities.push(entity);
        entity.id = this.newEntityId++;
        entity.definition.initializeEntity(this, entity);
        const area = entity.getArea();
        for (let j: number = area.position.y; j < area.position.y + area.size.height; j++) {
            for (let i: number = area.position.x; i < area.position.x + area.size.width; i++) {
                this.tiles[i][j].definitionIndex = 1; // dirt, todo make this a setting
                this.tiles[i][j].entity = entity;
            }
        }
        if (DEBUG)
            console.log("Placing entity " + entity.definition.key + " " + entity.id + " at " + entity.getArea().position.x + "," + entity.getArea().position.y);
    }

    public removeEntity(entity: TileEntity) {
        if (DEBUG)
            console.log("Removing entity " + entity.definition.key + " " + entity.id + " at " + entity.getArea().position.x + "," + entity.getArea().position.y);
        for (let i: number = 0; i < this._entities.length; i++) {
            if (this._entities[i].id === entity.id) {
                // remove all scheduled of this entity
                this._scheduler.removeScheduledEntityActions(entity);
                // remove from tiles
                const area = entity.getArea();
                for (let y: number = area.position.y; y < area.position.y + area.size.height; y++) {
                    for (let x: number = area.position.x; x < area.position.x + area.size.width; x++) {
                        this.tiles[x][y].entity = null;
                    }
                }
                // remove from entities list
                this._entities.splice(i, 1);
                // destroy the entity so any event handlers are cleaned up
                entity.definition.destroyEntity(this, entity);
                return;
            }
        }
    }

    public getTileEntityDefinition(key: string): TileEntityDefinition {
        return this.entitySet.get(key);
    }

    public getItem(key: string): ItemDefinition {
        return this.itemSet.get(key);
    }
}
