import * as globals from "./globals";

import { Random } from "./Random";
import { BuildingTileEntity } from "./simulation/core/entity/BuildingTileEntity";
import { TileEntity } from "./simulation/core/entity/TileEntity";
import { TileEntityDefinition } from "./simulation/core/entity/TileEntityDefinition";
import { ItemDefinition } from "./simulation/core/ItemDefinition";
import { IInputStorageContainer } from "./simulation/core/storage/IInputStorageContainer";
import { IOutputStorageContainer } from "./simulation/core/storage/IOutputStorageContainer";
import { Tile } from "./simulation/core/Tile";
import { TileDefinition } from "./simulation/core/TileDefinition";
import { TileModifierFlags } from "./simulation/core/TileModifierFlags";
import { World } from "./simulation/core/World";
import { BakeryTileEntityDefinition } from "./simulation/implementation/BakeryTileEntityDefinition";
import { BoulderTileEntityDefinition } from "./simulation/implementation/BoulderTileEntityDefinition";
import { ButcherTileEntityDefinition } from "./simulation/implementation/ButcherTileEntityDefinition";
import { HousePlotTileEntityDefinition } from "./simulation/implementation/HousePlotTileEntityDefinition";
import { HouseTileEntityDefinition } from "./simulation/implementation/HouseTileEntityDefinition";
import { MediumHouseTileEntityDefinition } from "./simulation/implementation/MediumHouseTileEntityDefinition";
import { PastureTileEntityDefinition } from "./simulation/implementation/PastureTileEntityDefinition";
import { StoneMasonTileEntityDefinition } from "./simulation/implementation/StoneMasonTileEntityDefinition";
import { TailorTileEntityDefinition } from "./simulation/implementation/TailorTileEntityDefinition";
import { WarehouseTileEntityDefinition } from "./simulation/implementation/WarehouseTileEntityDefinition";
import { WheatFarmPlotTileEntityDefinition } from "./simulation/implementation/WheatFarmPlotTileEntityDefinition";
import { WheatFarmTileEntityDefinition } from "./simulation/implementation/WheatFarmTileEntityDefinition";
import { WindMillTileEntityDefinition } from "./simulation/implementation/WindMillTileEntityDefinition";
import { WoodCutterTileEntityDefinition } from "./simulation/implementation/WoodCutterTileEntityDefinition";

let w: World;

export function getSetting(name: string) {
    const gl: any = globals;
    return gl[name];
}
export function setSetting(name: string, val: any) {
    const gl: any = globals;
    gl[name] = val;
}
export function clearOverlay() {
    globals.ctxOverlay.clearRect(0, 0, canvas.width, canvas.height);
}

export function clearBuildingStorage() {
    for (const entity of w.entities) {
        const outputContainer = entity.getMetadata<IOutputStorageContainer>();
        if (outputContainer.outputStorage)
            outputContainer.outputStorage.clear();

        const inputContainer = entity.getMetadata<IInputStorageContainer>();
        if (inputContainer.inputStorage)
            inputContainer.inputStorage.clear();
    }
}

let curTime = 0;
let lastTime = new Date().getTime();

export function jumpForward5min() {
    const startTime = new Date().getTime();
    curTime += 300000;
    w.scheduler.update(curTime, 300000);
    const endTime = new Date().getTime();

    console.log("Jumping 5min took " + (endTime - startTime) + " ms");
}

export function optimizeBuildingWithSimulatedAnnealing() {
    const availableDefinitionsForPlacement: string[] = [
        "woodcutter", "houseplot", "wheatfarmplot", "wheatfarm", "windmill", "bakery",
        "warehouse", "boulder", "stonemason", "pasture", "butcher", "tailor"
    ];

    const testOptimize = new OptimizeBuildingLayout(availableDefinitionsForPlacement, 30, 30, getActionSet());
    const runTest = () => {
        const result = testOptimize.step();

        w = initializeWorld(30, 30);
        testOptimize.currentState.applyOnWorld(w);
        curTime = 0;
        lastTime = new Date().getTime();

        if (result)
            window.setTimeout(runTest, 200);
    };
    runTest();
}

const canvas = <HTMLCanvasElement>$("#c").get(0);
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
globals.setRenderingContext(ctx);

const cOverlay = <HTMLCanvasElement>$("#cOverlay").get(0);
const ctxOverlay = <CanvasRenderingContext2D>cOverlay.getContext("2d");
globals.setOverlayRenderingContext(ctxOverlay);

const img = <HTMLImageElement>$("#imgTileset").get(0);
globals.setTileset(img);

export function main() {
    const nrOfCols = 30;
    const nrOfRows = 30;

    w = initializeWorld(nrOfRows, nrOfCols);
    placeEntities(w);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    w.draw();

    let frames = 0;
    let lastActionDump = curTime;
    const startTime = new Date().getTime();

    runDraw();
    runUpdate();

    function runDraw() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        w.draw();

        window.requestAnimationFrame(runDraw);

        frames++;

        updateDebug(w);
    }

    function runUpdate() {

        const newTime = new Date().getTime();
        let diff = newTime - lastTime;
        if (globals.SPEEDUP10) diff *= 10;
        lastTime = newTime;
        if (!globals.PAUSE) {
            curTime += diff;
            w.scheduler.update(curTime, diff);
        }

        window.setTimeout(runUpdate, 25);
    }

    function updateDebug(w: World) {
        const laggingBehind = (new Date().getTime() - startTime) - w.scheduler.currentTime;

        const nrOfSeconds = w.scheduler.currentTime / 1000;
        const aps = Math.round((w.scheduler.processedActionCount / nrOfSeconds) * 100) / 100;
        const avgIdleWorkerTime = Math.round((w.scoring.idleWorkerCount / nrOfSeconds) * 100) / 100;

        document.getElementById("debug").innerHTML = frames + " - World time: " + w.scheduler.currentTime + " - lagging behind: " + laggingBehind +
            `<br/>Nr of actions processed so far: ${w.scheduler.processedActionCount}, avg per sec: ${aps}` +
            `<br/>Money: ${w.scoring.money}, income: ${w.scoring.lastIncome}, expense: ${w.scoring.lastExpense}` +
            `<br/>#items produced: ${w.scoring.nrOfItemsProduced}, #items processed: ${w.scoring.nrOfItemsProcessed}` +
            `<br/>Avg. idle worker time:  ${avgIdleWorkerTime}/sec (total nr of workers: ${w.scoring.workerCount})`;

        let str = "";
        for (const e of w.entities) {
            const outputContainer = e.getMetadata<IOutputStorageContainer>();
            const inputContainer = e.getMetadata<IInputStorageContainer>();

            str += `<div class="building"><span>${e.definition.key} ${e.id}<br/>`;

            if (e instanceof BuildingTileEntity) {
                const states: string[] = [];
                for (const worker of (<BuildingTileEntity>e).workers) {
                    states.push(worker.id + ": " + worker.behaviour.executingState);
                }
                str += "Workers: " + states.join(",") + "<br/>";
            }
            if (outputContainer.outputStorage) {
                const outputDef = outputContainer.outputStorage.definition;
                str += `OUTPUT: Nr of slots: ${outputDef.nrOfStorageSlots}, max items per slot: ${outputDef.maxNrOfItems}</span><br/>`;
                for (let j: number = 0; j < outputDef.nrOfStorageSlots; j++) {
                    const perc = Math.round((outputContainer.outputStorage.getAmount(j) / outputDef.maxNrOfItems) * 100);
                    str += `<span class="item"><div class="load" data-perc="${perc}" style="width:${perc}%"></div>${outputContainer.outputStorage.getItem(j)}: ${outputContainer.outputStorage.getAmount(j)}</span>`;
                }
                str += "<br/>";
            }

            if (inputContainer.inputStorage) {
                const inputDef = inputContainer.inputStorage.definition;
                str += `INPUT: Nr of slots: ${inputDef.nrOfStorageSlots}, max items per slot: ${inputDef.maxNrOfItems}</span><br/>`;
                for (let j: number = 0; j < inputDef.nrOfStorageSlots; j++) {
                    const perc = Math.round((inputContainer.inputStorage.getAmount(j) / inputDef.maxNrOfItems) * 100);
                    str += `<span class="item"><div class="load" data-perc="${perc}" style="width:${perc}%"></div>${inputContainer.inputStorage.getItem(j)}: ${inputContainer.inputStorage.getAmount(j)}</span>`;
                }
            }
            str += `</div>`;
        }
        document.getElementById("storageDebug").innerHTML = str;

        if (curTime - lastActionDump > 100) {
            const actions = w.scheduler.getFutureActions();

            str = `<span>Number of actions: ${actions.length}</span><br/>`;
            for (const action of actions) {
                str += `<span>${Math.round(action.getTimeToFire()) - curTime} - ${action.getKey()}: ${action.description}</span>`;
                str += "<br/>";
            }
            document.getElementById("actionDebug").innerHTML = str;
            lastActionDump = curTime;
        }
    }

}

function initializeWorld(nrOfRows: number, nrOfCols: number): World {

    const tileset: TileDefinition[] = [
        new TileDefinition("grass"),
        new TileDefinition("dirt"),
        new TileDefinition("street", TileModifierFlags.None, 5),
        new TileDefinition("tree", TileModifierFlags.Woodcuttable, 0.8),
        new TileDefinition("water", TileModifierFlags.Blocked),
        new TileDefinition("boulder", TileModifierFlags.Blocked),
        new TileDefinition("sapling"),
    ];

    const itemset: ItemDefinition[] = [
        new ItemDefinition("wood", 0, 1),
        new ItemDefinition("plank", 1, 1),
        new ItemDefinition("wheat", 2, 1),
        new ItemDefinition("flour", 3, 1),
        new ItemDefinition("bread", 4, 1),
        new ItemDefinition("stone", 5, 1),
        new ItemDefinition("cow", 6, 1),
        new ItemDefinition("leather", 7, 1),
        new ItemDefinition("beef", 8, 1),
        new ItemDefinition("clothes", 9, 1),
    ];

    const entityset: TileEntityDefinition[] = [
        new WoodCutterTileEntityDefinition(),
        new WheatFarmPlotTileEntityDefinition(),
        new WheatFarmTileEntityDefinition(),
        new WindMillTileEntityDefinition(),
        new BakeryTileEntityDefinition(),
        new HousePlotTileEntityDefinition(),
        new HouseTileEntityDefinition(),
        new MediumHouseTileEntityDefinition(),
        new WarehouseTileEntityDefinition(),
        new BoulderTileEntityDefinition(),
        new StoneMasonTileEntityDefinition(),
        new PastureTileEntityDefinition(),
        new ButcherTileEntityDefinition(),
        new TailorTileEntityDefinition()
    ];
    const entities: TileEntity[] = [];

    const rnd = new Random(1);

    const tileSeeds = [0, 0, 1, 1, 3, 3, 3, 3, 4, 5];
    // let tileSeeds = [0, 0, 1, 1, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5];
    const tiles: Tile[][] = [];
    for (let i: number = 0; i < nrOfCols; i++) {
        tiles[i] = [];
        for (let j: number = 0; j < nrOfRows; j++) {
            tiles[i][j] = new Tile(tileSeeds[Math.floor(rnd.next() * tileSeeds.length)], null);
        }
    }

    for (let i: number = 10; i < 25; i++) {
        tiles[i][16] = new Tile(2, null);
        tiles[i][19] = new Tile(2, null);
        tiles[i][24] = new Tile(2, null);
    }
    for (let i: number = 0; i < 10; i++) {
        tiles[12][16 + i] = new Tile(2, null);
    }

    const w = new World(nrOfCols, nrOfRows, tileset, entityset, tiles, entities, itemset);

    w.scoring.money = 10000;
    return w;
}

function getActionSet(): ActionSet {
    const as = new ActionSet();

    as.actions.push(new Action(ActionEnum.place, "woodcutter", 10, 10));
    as.actions.push(new Action(ActionEnum.place, "woodcutter", 10, 20));

    as.actions.push(new Action(ActionEnum.place, "houseplot", 11, 14));
    as.actions.push(new Action(ActionEnum.place, "houseplot", 15, 14));
    as.actions.push(new Action(ActionEnum.place, "houseplot", 17, 17));
    as.actions.push(new Action(ActionEnum.place, "houseplot", 20, 17));
    as.actions.push(new Action(ActionEnum.place, "houseplot", 10, 17));

    as.actions.push(new Action(ActionEnum.place, "wheatfarmplot", 20, 20));
    as.actions.push(new Action(ActionEnum.place, "wheatfarmplot", 24, 16));

    as.actions.push(new Action(ActionEnum.place, "wheatfarm", 24, 20));
    as.actions.push(new Action(ActionEnum.place, "windmill", 23, 26));
    as.actions.push(new Action(ActionEnum.place, "windmill", 26, 24));
    as.actions.push(new Action(ActionEnum.place, "bakery", 20, 26));

    as.actions.push(new Action(ActionEnum.place, "warehouse", 15, 20));
    as.actions.push(new Action(ActionEnum.place, "warehouse", 13, 20));

    as.actions.push(new Action(ActionEnum.place, "boulder", 20, 10));
    as.actions.push(new Action(ActionEnum.place, "stonemason", 16, 10));

    as.actions.push(new Action(ActionEnum.place, "pasture", 3, 20));
    as.actions.push(new Action(ActionEnum.place, "butcher", 5, 18));
    as.actions.push(new Action(ActionEnum.place, "tailor", 13, 17));
    return as;
}

function placeEntities(w: World): ActionSet {
    const as = getActionSet();
    if (as.canApplyOnWorld(w))
        as.applyOnWorld(w);
    return as;
}

enum ActionEnum {
    place
}
class Action {
    constructor(public actionType: ActionEnum, public entity: string, public x: number, public y: number) {

    }

    public mutate(availableEntityDefinitions: string[], rnd: Random, nrOfCols: number, nrOfRows: number): Action {
        const a = this.clone();

        const val = rnd.next();
        if (val < 1 / 5) {
            a.x++;
        } else if (val < 2 / 5)
            a.x--;
        else if (val < 3 / 5)
            a.y++;
        else if (val < 4 / 5)
            a.y--;
        else if (val < 5 / 5)
            a.entity = availableEntityDefinitions[Math.floor(rnd.next() * availableEntityDefinitions.length)];

        if (a.x >= nrOfCols - 1) a.x = nrOfCols - 1 - 1;
        if (a.y >= nrOfRows - 1) a.y = nrOfRows - 1 - 1;
        if (a.x < 0) a.x = 0;
        if (a.y < 0) a.y = 0;

        return a;
    }

    public clone(): Action {
        return new Action(this.actionType, this.entity, this.x, this.y);
    }
    public static getRandom(availableEntityDefinitions: string[], rnd: Random, nrOfCols: number, nrOfRows: number): Action {
        return new Action(ActionEnum.place,
            availableEntityDefinitions[Math.floor(rnd.next() * availableEntityDefinitions.length)],
            Math.floor(rnd.next() * nrOfCols),
            Math.floor(rnd.next() * nrOfRows));
    }
}

class ActionSet {
    public actions: Action[] = [];

    public mutate(availableEntityDefinitions: string[], rnd: Random, nrOfCols: number, nrOfRows: number): ActionSet {
        const val = rnd.next();
        if (val < 4 / 6) {
            // mutate an existing action
            const idx = Math.floor(rnd.next() * this.actions.length);

            const actionSet = this.clone();
            actionSet.actions[idx] = this.actions[idx].mutate(availableEntityDefinitions, rnd, nrOfCols, nrOfRows);
            return actionSet;
        } else if (val < 5 / 6) {
            // add an action
            const actionSet = this.clone();
            actionSet.actions.push(Action.getRandom(availableEntityDefinitions, rnd, nrOfCols, nrOfRows));
            return actionSet;
        } else if (val < 6 / 6) {
            // remove an action
            const idx = Math.floor(rnd.next() * this.actions.length);
            const actionSet = new ActionSet();
            for (let i: number = 0; i < this.actions.length; i++) {
                if (i !== idx)
                    actionSet.actions.push(this.actions[i]);
            }
            return actionSet;
        } else throw new Error();
    }

    public clone(): ActionSet {
        const actionSet = new ActionSet();
        actionSet.actions = this.actions.slice(0);
        return actionSet;
    }

    public canApplyOnWorld(world: World): boolean {
        const entities: TileEntity[] = [];
        const isValid: boolean = true;
        for (const a of this.actions) {
            if (a.actionType === ActionEnum.place) {
                const entity = world.getTileEntityDefinition(a.entity).createInstance(world, a.x, a.y);
                if (!world.canPlaceEntity(entity)) {
                    console.log("entity can't be placed: " + entity.definition.key + " on " + entity.getArea().position.toString());
                    for (const entity of entities)
                        world.removeEntity(entity);
                    return false;
                } else {
                    entities.push(entity);
                    world.placeEntity(entity);
                }
            }
        }

        for (const entity of entities)
            world.removeEntity(entity);
        return true;
    }

    public applyOnWorld(world: World) {
        for (const a of this.actions) {
            if (a.actionType === ActionEnum.place) {
                const entity = world.getTileEntityDefinition(a.entity).createInstance(world, a.x, a.y);
                world.placeEntity(entity);
            }
        }
    }
}

class OptimizeBuildingLayout {

    private readonly rnd = new Random(7707);
    private readonly maxIterations = 200;

    private currentActionSet: ActionSet;
    get currentState(): ActionSet { return this.currentActionSet; }

    private currentScore: number;

    private readonly emptyWorld: World;
    constructor(private readonly availableEntityDefinitions: string[], private readonly nrOfCols: number, private readonly nrOfRows: number, actionSet: ActionSet) {
        this.currentActionSet = actionSet;
        this.currentScore = this.getScore(this.currentActionSet);
        this.emptyWorld = initializeWorld(this.nrOfCols, this.nrOfRows);
        this.addLog("Current score: " + this.currentScore);

        $("#simulatedAnnealingDebug").show();
    }

    public addLog(msg: string) {
        const el = $(`<span>${msg}</span>`);
        $("#simulatedAnnealingDebug").append(el);
    }

    private iteration = 0;
    private readonly values: number[] = [];
    public step(): boolean {

        const nrOfAttempts = 0;
        let newAS: ActionSet;
        newAS = this.currentActionSet.mutate(this.availableEntityDefinitions, this.rnd, this.nrOfCols, this.nrOfRows);
        /*  do {
              newAS = this.currentActionSet.mutate(this.availableEntityDefinitions, this.rnd, this.nrOfCols, this.nrOfRows);
              nrOfAttempts++;
          }
          while (!newAS.canApplyOnWorld(this.emptyWorld) && nrOfAttempts < 5)
  */
        if (newAS.canApplyOnWorld(this.emptyWorld)) {
            const newScore = this.getScore(newAS);
            if (newScore == 0) {
                console.log(newAS);
                this.currentActionSet = newAS;
                this.currentScore = newScore;
                return false;
            }
            if (newScore > this.currentScore) {
                // accept it
                this.addLog("Iteration " + this.iteration + ": score " + newScore + ", ACCEPTED");
                this.currentActionSet = newAS;
                this.currentScore = newScore;
            } else {
                const probability = this.getProbability(this.currentScore, newScore);

                if (this.rnd.next() < probability) {
                    // accept it
                    this.addLog("Iteration " + this.iteration + ": score " + newScore + ", ACCEPTED with probability " + probability);
                    this.currentActionSet = newAS;
                    this.currentScore = newScore;
                } else {
                    this.addLog("Iteration " + this.iteration + ": score " + newScore + ", REJECTED with probability " + probability);
                }
            }

            this.iteration++;
        }
        return this.iteration < this.maxIterations;
    }

    public getProbability(oldScore: number, newScore: number): number {
        const temperature = this.maxIterations - this.iteration;
        if (newScore < oldScore) {
            return Math.exp((newScore - oldScore) / temperature);
        } else
            return 1;
    }

    public onDone() {
        let max: number = Number.MIN_VALUE;
        let min: number = Number.MAX_VALUE;
        for (let i: number = 0; i < this.values.length; i++) {
            if (this.values[i] > max) {
                max = this.values[i];
            }
            if (this.values[i] > 0 && this.values[i] < min) {
                min = this.values[i];
            }
        }

        for (let i: number = 0; i < this.values.length; i++) {

            if (this.values[i] > 0) {
                const alpha = (this.values[i] - min) / (max - min);
                const r = Math.round(alpha * 255);
                const b = Math.round((1 - alpha) * 255);

                ctxOverlay.fillStyle = `rgba(${r}, 0,${b}, 0.5)`;

                const x = i % this.nrOfCols;
                const y = Math.floor(i / this.nrOfCols);

                ctxOverlay.fillRect(x * globals.TILE_WIDTH, y * globals.TILE_HEIGHT, globals.TILE_WIDTH, globals.TILE_HEIGHT);
            }
        }
    }

    public getScore(as: ActionSet): number {
        const w = initializeWorld(this.nrOfCols, this.nrOfRows);
        as.applyOnWorld(w);

        const nrOfSecToRun = 600;
        w.scheduler.update(nrOfSecToRun * 1000, nrOfSecToRun * 1000);

        return 10 * w.scoring.nrOfItemsProduced
            + 100 * w.scoring.nrOfItemsProcessed
            + 100 * (w.scoring.lastIncome - w.scoring.lastExpense)
            - 1000 * w.scoring.idleWorkerCount / nrOfSecToRun;
    }
}
