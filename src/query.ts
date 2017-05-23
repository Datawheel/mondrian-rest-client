import formurlencoded = require('form-urlencoded');

import Cube from './cube';
import { Level, Hierarchy } from './dimension';
import Measure from './measure';

export default class Query {

    cube: Cube;

    private measures: Measure[];
    private drilldowns: Level[];
    private cuts: string[];
    private properties: string[];
    private captions: string[];
    public options: { [opt: string]: boolean } = {
        'nonempty': true,
        'distinct': false,
        'parents': false,
        'debug': false
    };

    constructor(cube: Cube) {
        this.cube = cube;
    }

    drilldown(...parts: string[]) {
        const lvl = this.getLevel(...parts);


        if (this.drilldowns === undefined) {
            this.drilldowns = [lvl]
        }
        else {
            this.drilldowns.push(lvl);
        }

        return this;
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
            cut: this.cuts ? [`{${this.cuts.join(",")}}`] : undefined,
            measures: this.measures ? this.measures.map((m) => m.name) : undefined,
            properties: this.properties,
            caption: this.captions,
            nonempty: this.options['nonempty'],
            distinct: this.options['distinct'],
            parents: this.options['parents'],
            debug: this.options['debug']
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
