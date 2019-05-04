import { Map } from "../../datastructs/Map";
import { PriorityQueue } from "../../datastructs/PriorityQueue";
import { CHEAP_COST_PATHING, ctxOverlay, FOUR_WAY, MAX_TILE_SPEED, SHOW_SHORTEST_PATH_VISITED, TILE_HEIGHT, TILE_WIDTH } from "../../globals";
import { Area } from "./Area";
import { AStarNode } from "./AStarNode";
import { Position } from "./Position";
import { World } from "./World";
import { WorldModule } from "./WorldModule";

export class WorldPathFinder extends WorldModule {
    constructor(world: World) {
        super(world);
    }

    getShortestPath(fromX: number, fromY: number, to: Area, neighbourPredicate: (x: number, y: number) => boolean): Position[] {
        if (isNaN(fromX) || isNaN(fromY) || to == null)
            throw new Error("Invalid from - to");
        fromX = Math.floor(fromX);
        fromY = Math.floor(fromY);
        const queue = new PriorityQueue<AStarNode>();
        const visited = new Map<number>();
        const heuristic = WorldPathFinder.getDistance(fromX, fromY, to) / MAX_TILE_SPEED; // dividing by max tile speed ensures that the heuristic is always the smallest increment possible
        const startNode = new AStarNode(null, new Position(fromX, fromY), 0 + heuristic);
        queue.enqueue(startNode);
        const nrIterations: number = 0;

        while (queue.size > 0) {
            if (nrIterations > 100)
                return null;

            const node = queue.dequeue();
            if (!visited.containsKey(node.getKey())) {
                visited.put(node.getKey(), 0);
                if (SHOW_SHORTEST_PATH_VISITED) {
                    ctxOverlay.beginPath();
                    ctxOverlay.fillStyle = "rgba(0, 0,255, 0.2)";
                    ctxOverlay.strokeStyle = "rgba(0, 0,255, 1)";
                    ctxOverlay.rect(Math.floor(node.position.x) * TILE_WIDTH, Math.floor(node.position.y) * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                    ctxOverlay.stroke();
                    ctxOverlay.fillRect(Math.floor(node.position.x) * TILE_WIDTH, Math.floor(node.position.y) * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                }

                if (to.contains(node.position.x, node.position.y)) {
                    // found path
                    return WorldPathFinder.getPathFromNode(node);
                }

                const nodeTileSpeed = this.world.getTileDefinition(this.world.tiles[node.position.x][node.position.y].definitionIndex).speed;
                for (let j: number = node.position.y - 1; j <= node.position.y + 1; j++) {
                    for (let i: number = node.position.x - 1; i <= node.position.x + 1; i++) {
                        if (i >= 0 && j >= 0 && i < this.world.nrOfCols && j < this.world.nrOfRows &&
                            (i !== node.position.x || j !== node.position.y)) {

                            const pos = new Position(i, j);
                            const isDiagonal = (i !== node.position.x && j !== node.position.y);

                            if (FOUR_WAY && isDiagonal)
                                continue; // TODO

                            const baseCostToMoveToNeighbour = isDiagonal ? Math.SQRT2 : 1;
                            const defIdx = this.world.tiles[i][j].definitionIndex;
                            const neighBourTileSpeed = this.world.getTileDefinition(defIdx).speed;
                            const costToMoveToNeighbour = (baseCostToMoveToNeighbour / 2) / nodeTileSpeed +
                                (baseCostToMoveToNeighbour / 2) / neighBourTileSpeed;

                            if (to.contains(i, j)) {
                                // the target may be blocked, all other tiles may not
                                // found path
                                const heuristic = WorldPathFinder.getDistance(pos.x, pos.y, to) / MAX_TILE_SPEED; // dividing by max tile speed ensures that the heuristic is always the smallest increment possible
                                const cost = node.cost + costToMoveToNeighbour + heuristic;
                                return WorldPathFinder.getPathFromNode(new AStarNode(node, pos, cost));
                            }

                            if (neighbourPredicate(i, j) && !visited.containsKey(pos.toString())) {
                                const pos = new Position(i, j);
                                const heuristic = WorldPathFinder.getDistance(pos.x, pos.y, to) / MAX_TILE_SPEED; // dividing by max tile speed ensures that the heuristic is always the smallest increment possible
                                let cost;
                                if (CHEAP_COST_PATHING)
                                    cost = heuristic;
                                else
                                    cost = node.cost + costToMoveToNeighbour + heuristic;
                                const existingNode = queue.get(pos.toString());
                                if (typeof existingNode === "undefined")
                                    queue.enqueue(new AStarNode(node, pos, cost));
                                else if (existingNode.cost > cost) {
                                    existingNode.cost = cost;
                                    queue.updatePriority(existingNode);
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
    /**
     * Uses A* to find the shortest path from a coordinate to an area
     * @param ignoreBlockedArea indicates the area that if true will still be passed through. This is necessary when a worker is inside its building entity (that is usually blocked)
     */
    public getShortestPathForWorker(fromX: number, fromY: number, ignoreBlockedArea: Area, to: Area): Position[] {
        const neighbourPredicate: (x: number, y: number) => boolean = (i, j) => !this.world.tiles[i][j].isBlocked(this.world) || ignoreBlockedArea.contains(i, j);
        return this.getShortestPath(fromX, fromY, to, neighbourPredicate);
    }
    private static getPathFromNode(node: AStarNode): Position[] {
        const route: Position[] = [];
        let n = node;
        while (n !== null) {
            route.push(n.position);
            n = n.parent;
        }
        route.reverse();
        return route;
    }

    private static getDistance(fromX: number, fromY: number, to: Area): number {
        const toX = to.position.x + to.size.width / 2;
        const toY = to.position.y + to.size.height / 2;
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        // return Math.SQRT2 * Math.min(dx,dy) + Math.abs(dx - dy);
        if (FOUR_WAY)
            return (dx + dy);
        else
            return Math.sqrt(dx * dx + dy * dy);
    }
}
