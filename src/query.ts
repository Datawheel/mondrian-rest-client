import formurlencoded = require('form-urlencoded');

import Cube from './cube';
import { Level, Hierarchy } from './dimension';
import Measure from './measure';
import NamedSet from './namedSet';

export type Drillable = NamedSet | Level;

export default class Query {

    cube: Cube;

    private measures: Measure[];
    private drilldowns: Drillable[];
    private cuts: string[];
    private properties: string[];
    private captions: string[];
    private filters: string[];
    private limit: number;
    private offset: number;
    private orderProp: string;
    private orderDir: boolean;
    public options: { [opt: string]: boolean } = {
        'nonempty': true,
        'distinct': false,
        'parents': false,
        'debug': false,
        'sparse': true
    };

    constructor(cube: Cube) {
        this.cube = cube;
    }

    getDrilldowns(): Drillable[] {
        return this.drilldowns;
    }

    drilldown(...parts: string[]){

        var drillable: Drillable;

        if (parts.length === 1) {
            drillable = this.cube.findNamedSet(parts[0]);
        }
        else {
            drillable = this.getLevel(...parts);
        }

        if (this.drilldowns === undefined) {
            this.drilldowns = [drillable]
        }
        else {
            this.drilldowns.push(drillable);
        }

        return this;
    }

    getMeasures(): Measure[] {
        return this.measures;
    }

    measure(measureName: string): Query {
        const measure: Measure = this.cube.findMeasure(measureName);
        if (this.measures === undefined) {
            this.measures = [measure];
        }
        else {
            this.measures.push(measure);
        }
        return this;
    }

    cut(member: string): Query {
        if (this.cuts === undefined) {
            this.cuts = [member];
        }
        else {
            this.cuts.push(member);
        }
        return this;
    }

    property(...parts: string[]): Query {
        const propFullName = this.getProperty(...parts);
        if (this.properties === undefined) {
            this.properties = [propFullName];
        }
        else {
            this.properties.push(propFullName);
        }
        return this;
    }

    caption(...parts: string[]): Query {
        const propFullName = this.getProperty(...parts)
        if (this.captions === undefined) {
            this.captions = [propFullName];
        }
        else {
            this.captions.push(propFullName);
        }
        return this;
    }

    filter(measureName: string, comparison: string, value: number): Query {
        const measure: Measure = this.cube.findMeasure(measureName);
        const filter = `${measure.name} ${comparison} ${value}`;
        if (this.filters === undefined) {
            this.filters = [filter];
        }
        else {
            this.filters.push(filter);
        }
        return this;
    }

    pagination(limit: number, offset: number) {
        this.limit = limit || undefined;
        this.offset = offset || undefined;
        return this;
    }

    sorting(parts: string | string[], direction: boolean) {
        if ('string' == typeof parts) {
            const measure: Measure = this.cube.findMeasure(parts);
            this.orderProp = `Measures.[${measure.name}]`;
        } else {
            const property: string = this.getProperty(...parts);
            this.orderProp = property;
        }
        this.orderDir = direction;
        return this;
    }

    option(option: string, value: boolean): Query {
        if (!this.options.hasOwnProperty(option)) {
            throw new Error(`Property ${option} is invalid`);
        }
        this.options[option] = value;
        return this;
    }

    get qs(): string {
        const o = {
            drilldown: this.drilldowns ? this.drilldowns.map((d) => d.fullName) : undefined,
            cut: this.cuts,
            measures: this.measures ? this.measures.map((m) => m.name) : undefined,
            properties: this.properties,
            caption: this.captions,
            filter: this.filters,
            limit: this.limit,
            offset: this.offset,
            order: this.orderProp,
            order_desc: this.orderDir,
            nonempty: this.options['nonempty'],
            distinct: this.options['distinct'],
            parents: this.options['parents'],
            debug: this.options['debug'],
            sparse: this.options['sparse']
        };

        return formurlencoded(o);
    }

    path(format?: string): string {
        return `/cubes/${this.cube.name}/aggregate${format ? '.' + format : ''}?${this.qs}`;
    }

    private getLevel(...parts: string[]): Level {
        let [dimension, hierarchyOrLevel, level] = parts;

        if (!(dimension in this.cube.dimensionsByName)) {
            throw new Error(`${dimension} does not exist in cube ${this.cube.name}`);
        }
        const dim = this.cube.dimensionsByName[dimension];

        const lvl = level === undefined
            ? dim.hierarchies[0].getLevel(hierarchyOrLevel)
            : dim.getHierarchy(hierarchyOrLevel).getLevel(level);

        return lvl;
    }

    private getProperty(...parts: string[]): string {
        if (parts.length < 3) {
            throw new Error("Property specification must be Dimension.(Hierarchy).Level.Property");
        }

        const pname = parts[parts.length - 1];
        const level = this.getLevel(...parts.slice(0, parts.length - 1));

        if (!level.hasProperty(pname)) {
            throw new Error(`Property ${pname} does not exist in level ${level.fullName}`);
        }

        return `${level.fullName}.${pname}`;
    }
}
