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
    private options: { [opt: string]: boolean } = {
        'nonempty': true,
        'distinct': false,
        'parents': false,
        'debug': false
    };

    constructor(cube: Cube) {
        this.cube = cube;
    }

    drilldown(dimension: string, hierarchyOrLevel: string, level?: string) {
        let lvl: Level;

        if (!(dimension in this.cube.dimensionsByName)) {
            throw new Error(`${dimension} does not exist in cube ${this.cube.name}`);
        }
        const dim = this.cube.dimensionsByName[dimension];

        if (level == undefined) {
            lvl = dim.hierarchies[0].getLevel(hierarchyOrLevel);
        }
        else {
            lvl = dim.getHierarchy(hierarchyOrLevel).getLevel(level);
        }

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

    property(property: string): Query {
        if (this.properties === undefined) {
            this.properties = [property];
        }
        else {
            this.properties.push(property);
        }
        return this;
    }

    caption(caption: string): Query {
        if (this.captions === undefined) {
            this.captions = [caption];
        }
        else {
            this.captions.push(caption);
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
            drilldown: this.drilldowns ? this.drilldowns.map((d) => d.fullName) : null,
            cut: this.cuts,
            measures: this.measures ? this.measures.map((m) => m.name) : null,
            properties: this.properties,
            captions: this.captions,
            nonempty: this.options['nonempty'],
            distinct: this.options['distinct'],
            parents: this.options['parents'],
            debug: this.options['debug']
        };

        return formurlencoded(o);
    }
}
