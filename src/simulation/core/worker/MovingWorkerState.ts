import { ctx, SHOW_WORKER_PATHS, TILE_HEIGHT, TILE_WIDTH } from "../../../globals";
import { Area } from "../Area";
import { Position } from "../Position";
import { Worker } from "./Worker";
import { WorkerState } from "./WorkerState";

export class MovingWorkerState extends WorkerState {
    private readonly destination: Area;
    private readonly source: Area;
    private finished: boolean;
    private success: boolean;
    private readonly roadSegments: Segment[];

    constructor(key: string, worker: Worker, source: Area, destination: Area, roadSegments: Segment[] = null) {
        super(key, worker);
        this.destination = destination;
        this.source = source;
        const x = this.worker.position.x;
        const y = this.worker.position.y;
        if (roadSegments === null) {
            const road = this.worker.findPath(source, destination);
            if (road !== null) {
                this.roadSegments = [];
                this.roadSegments.push(new Segment(x, y, 0));
                this.addSegmentsBetween(this.roadSegments, x, y, road[0].x + 0.5, road[0].y + 0.5);
                for (let i: number = 0; i < road.length - 1; i++) {
                    this.addSegmentsBetween(this.roadSegments, road[i].x + 0.5, road[i].y + 0.5, road[i + 1].x + 0.5, road[i + 1].y + 0.5);
                }
            } else {
                this.success = false;
                this.finished = true;
            }
        } else
            this.roadSegments = roadSegments;
    }

    public static FromExistingMovingWorkerState(key: string, worker: Worker, source: Area, destination: Area, existingState: MovingWorkerState): MovingWorkerState {
        if (existingState.destination.equals(source) && existingState.source.equals(destination)) {
            const segments = existingState.roadSegments.slice(0);
            segments.reverse();
            return new MovingWorkerState(key, worker, source, destination, segments);
        } else
            return new MovingWorkerState(key, worker, source, destination);
    }

    private addSegmentsBetween(roadSegments: Segment[], fromX: number, fromY: number, toX: number, toY: number) {
        // from -> to will only be to neighbour or to diagonals
        // and always from the middle of the cells so each segment will be
        // 0.5 long for hor/ver  and SQRT2 / 2 long for diagonal
        if (fromX === toX && fromY !== toY) {
            // vertical
            let midY;
            if (fromY < toY) // to the bottom
                midY = Math.ceil(fromY);
            else // to the top
                midY = Math.floor(fromY);
            this.addRoadSegments(roadSegments, 0.5, fromX, midY, toX, toY);

        } else if (fromX !== toX && fromY === toY) {
            // horizontal
            let midX;
            if (fromX < toX) // to the right
                midX = Math.ceil(fromX);
            else // to the left
                midX = Math.floor(fromX);
            this.addRoadSegments(roadSegments, 0.5, midX, fromY, toX, toY);

        } else if (fromX !== toX && fromY !== toY) {
            // diagonal
            let midX;
            if (fromX < toX) // to the right
                midX = Math.ceil(fromX);
            else // to the left
                midX = Math.floor(fromX);
            let midY;
            if (fromY < toY) // to the bottom
                midY = Math.ceil(fromY);
            else // to the top
                midY = Math.floor(fromY);
            this.addRoadSegments(roadSegments, Math.SQRT2 / 2, midX, midY, toX, toY);
        }
    }

    private addRoadSegments(roadSegments: Segment[], length: number, fromX: number, fromY: number, toX: number, toY: number) {
        let defIdx = this.worker.world.getTile(fromX, fromY).definitionIndex;
        const tileSpeed1 = this.worker.world.getTileDefinition(defIdx).speed;

        defIdx = this.worker.world.getTile(toX, toY).definitionIndex;
        const tileSpeed2 = this.worker.world.getTileDefinition(defIdx).speed;

        const nrOfSeconds1 = length / tileSpeed1; // tiles / tiles/sec
        const nrOfSeconds2 = length / tileSpeed2; // tiles / tiles/sec

        roadSegments.push(new Segment(fromX, fromY, nrOfSeconds1 * 1000));
        roadSegments.push(new Segment(toX, toY, nrOfSeconds2 * 1000));
    }

    public update(timePassed: number) {
        this.runningFor += timePassed;
        if (this.roadSegments === null)
            return;
        const pos = this.getPositionAt(this.runningFor);
        if (pos.x === this.roadSegments[this.roadSegments.length - 1].x &&
            pos.y === this.roadSegments[this.roadSegments.length - 1].y) {
            this.success = true;
            this.finished = true;
        }
        this.worker.position.x = pos.x;
        this.worker.position.y = pos.y;
    }

    private getPositionAt(time: number): Position {
        let cumulDuration = 0; // assuming the first segment is the current state
        if (this.roadSegments === null)
            return new Position(this.worker.position.x, this.worker.position.y);
        for (let i: number = 1; i < this.roadSegments.length; i++) {
            const lbound = cumulDuration;
            const ubound = cumulDuration + this.roadSegments[i].duration;
            if (time >= lbound && time < ubound) {
                // determine the alpha that indicates how far we are
                // between the last segment and the current,
                // for linear interpolation
                const alpha = (time - lbound) / (ubound - lbound);
                // now apply that alpha on both vX and vY
                const vX = this.roadSegments[i].x - this.roadSegments[i - 1].x;
                const vY = this.roadSegments[i].y - this.roadSegments[i - 1].y;
                return new Position(this.roadSegments[i - 1].x + alpha * vX, this.roadSegments[i - 1].y + alpha * vY);
            }
            cumulDuration += this.roadSegments[i].duration;
        }
        return new Position(this.roadSegments[this.roadSegments.length - 1].x, this.roadSegments[this.roadSegments.length - 1].y);
    }

    public getDuration(): number {
        let duration = 0;
        if (this.roadSegments === null)
            return Number.MAX_VALUE;
        for (const seg of this.roadSegments) {
            duration += seg.duration;
        }
        return duration;
    }

    public isFinished(): boolean {
        return this.finished;
    }

    public isSuccesful(): boolean {
        return this.success;
    }

    public draw() {
        if (SHOW_WORKER_PATHS && this.roadSegments !== null) {
            ctx.beginPath();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = this.worker.color; // "rgba(64,64,64,0.8)";
            ctx.lineWidth = 5;
            for (let i: number = 0; i < this.roadSegments.length - 1; i++) {
                ctx.moveTo(Math.floor(this.roadSegments[i].x * TILE_WIDTH), Math.floor(this.roadSegments[i].y * TILE_HEIGHT));
                ctx.lineTo(Math.floor(this.roadSegments[i + 1].x * TILE_WIDTH) + 0.5, Math.floor(this.roadSegments[i + 1].y * TILE_HEIGHT) + 0.5);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}
