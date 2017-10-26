import Cube from './cube';
import { Level } from './dimension';
import Measure from './measure';
import NamedSet from './namedSet';
export declare type Drillable = NamedSet | Level;
export default class Query {
    cube: Cube;
    private measures;
    private drilldowns;
    private cuts;
    private properties;
    private captions;
    options: {
        [opt: string]: boolean;
    };
    constructor(cube: Cube);
    getDrilldowns(): Drillable[];
    drilldown(...parts: string[]): this;
    getMeasures(): Measure[];
    measure(measureName: string): Query;
    cut(member: string): Query;
    property(...parts: string[]): Query;
    caption(...parts: string[]): Query;
    option(option: string, value: boolean): Query;
    readonly qs: string;
    path(format?: string): string;
    private getLevel(...parts);
    private getProperty(...parts);
}
