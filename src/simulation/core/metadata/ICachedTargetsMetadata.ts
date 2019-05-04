import { Map } from "../../../datastructs/Map";
import { Area } from "../Area";
import { IMetadata } from "./IMetadata";

export interface ICachedTargetsMetadata extends IMetadata {
    targetsInRadius: Map<Area[]>;
}
