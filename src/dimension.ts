import { Annotations } from './annotations';
import Cube from './cube';

const INTRINSIC_PROPERTIES = [
    'Caption',
    'Key',
    'Name',
    'UniqueName'
];

export class Level {
    name: string;
    caption?: string;
    fullName: string;
    depth: number;
    annotations: Annotations = {};
    properties: string[];
    hierarchy: Hierarchy;

    constructor(name: string, caption: string, fullName: string,
        depth: number, annotations: Annotations, properties: string[]) {
        this.name = name;
        this.caption = caption;
        this.fullName = fullName;
        this.depth = depth;
        this.annotations = annotations;
        this.properties = properties;
    }

    static fromJSON(json: {}): Level {
        const l = new Level(json['name'],
            json['caption'],
            json['full_name'],
            json['depth'],
            json['annotations'],
            json['properties']);
        return l;
    }

    hasProperty(propertyName: string): boolean {
        return this.properties.indexOf(propertyName) > -1
            || INTRINSIC_PROPERTIES.indexOf(propertyName) > -1;
    }

    membersPath(): string {
        return `/dimensions/${this.hierarchy.dimension.name}/hierarchies/${this.hierarchy.name}/levels/${this.name}/members`;
    }
}

export class Hierarchy {
    name: string;
    allMemberName: string;
    levels: Level[];
    dimension: Dimension;

    constructor(name: string, allMemberName: string, levels: Level[]) {
        this.name = name;
        this.allMemberName = allMemberName;
        this.levels = levels.map((l) => Object.assign(l, { hierarchy: this }));
    }

    static fromJSON(json: {}): Hierarchy {
        const h = new Hierarchy(json['name'],
            json['all_member_name'],
            json['levels'].map(Level.fromJSON))
        return h;
    }

    getLevel(levelName: string) {
        const level = this.levels.find((l) => l.name === levelName)
        if (level === undefined) {
            throw new Error(`${levelName} does not exist in hierarchy ${this.name}`);
        }
        return level;
    }
}

export enum DimensionType {
    Standard,
    Time
}

export default class Dimension {
    name: string;
    caption: string;
    dimensionType: DimensionType;
    annotations: Annotations;
    hierarchies: Hierarchy[];
    cube: Cube;

    constructor(name: string,
        caption: string | null,
        dimensionType: string,
        hierarchies: Hierarchy[],
        annotations: Annotations | null) {

        this.name = name;
        this.caption = caption;
        switch (dimensionType) {
            case 'time':
                this.dimensionType = DimensionType.Time;
                break;
            case 'standard':
                this.dimensionType = DimensionType.Standard;
                break;
            default:
                throw new TypeError(`${dimensionType} is not a valid DimensionType`)
        }
        this.hierarchies = hierarchies.map((h) => Object.assign(h, { dimension: this }));
        this.annotations = annotations;
    }

    static fromJSON(json: {}): Dimension {
        const d: Dimension = new Dimension(json['name'],
            json['caption'],
            json['type'],
            json['hierarchies'].map(Hierarchy.fromJSON),
            json['annotations']);
        return d;
    }

    getHierarchy(hierarchyName: string) {
        const hierarchy = this.hierarchies.find((h) => h.name === hierarchyName)
        if (hierarchy === undefined) {
            throw new Error(`${hierarchyName} does not exist in dimension ${this.name}`);
        }
        return hierarchy;
    }
}
