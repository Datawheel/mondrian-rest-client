import { Annotations } from './annotations';
import Cube from './cube';
export declare class Level {
    name: string;
    caption?: string;
    fullName: string;
    depth: number;
    annotations: Annotations;
    properties: string[];
    hierarchy: Hierarchy;
    constructor(name: string, caption: string, fullName: string, depth: number, annotations: Annotations, properties: string[]);
    static fromJSON(json: {}): Level;
    hasProperty(propertyName: string): boolean;
    membersPath(): string;
}
export declare class Hierarchy {
    name: string;
    allMemberName: string;
    levels: Level[];
    dimension: Dimension;
    constructor(name: string, allMemberName: string, levels: Level[]);
    static fromJSON(json: {}): Hierarchy;
    getLevel(levelName: string): Level;
}
export declare enum DimensionType {
    Standard = 0,
    Time = 1,
}
export default class Dimension {
    name: string;
    caption: string;
    dimensionType: DimensionType;
    annotations: Annotations;
    hierarchies: Hierarchy[];
    cube: Cube;
    constructor(name: string, caption: string | null, dimensionType: string, hierarchies: Hierarchy[], annotations: Annotations | null);
    static fromJSON(json: {}): Dimension;
    getHierarchy(hierarchyName: string): Hierarchy;
}
