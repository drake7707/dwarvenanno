
export let DEBUG = false;

export let MAX_TILE_SPEED = 10; // don't go over this when defining speed, otherwise the heuristic in A* falls apart

export let TILE_WIDTH = 16;
export let TILE_HEIGHT = 16;

export let CHEAP_COST_PATHING = false;
export let FOUR_WAY = false;
export let SHOW_RADII = false;
export let SHOW_SHORTEST_PATH_VISITED = false;
export let SHOW_WORKER_PATHS = true;
export let PAUSE = false;
export let SPEEDUP10 = false;

export let img: HTMLImageElement;
export let ctx: CanvasRenderingContext2D;
export let ctxOverlay: CanvasRenderingContext2D;

export function setTileset(tileset: HTMLImageElement) {
    img = tileset;
}

export function setRenderingContext(context: CanvasRenderingContext2D) {
    ctx = context;
}

export function setOverlayRenderingContext(context: CanvasRenderingContext2D) {
    ctxOverlay = context;
}
