import { Map } from "../../../datastructs/Map";
import { Area } from "../Area";
import { ICachedTargetsMetadata } from "./ICachedTargetsMetadata";

export class CachedTargetsMetadata implements ICachedTargetsMetadata {
    public targetsInRadius: Map<Area[]> = new Map<Area[]>();
}
