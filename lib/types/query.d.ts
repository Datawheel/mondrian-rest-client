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
    private filters;
    private limit;
    private offset;
    private orderProp;
    private orderDir;
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
    filter(measureName: string, comparison: string, value: number): Query;
    pagination(limit: number, offset: number): this;
    sorting(parts: string | string[], direction: boolean): this;
    option(option: string, value: boolean): Query;
    readonly qobj: any;
    readonly qs: string;
    path(format?: string): string;
    private getLevel(...parts);
    private getProperty(...parts);
}
