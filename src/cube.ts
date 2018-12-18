import { unique } from 'shorthash';

import Measure from './measure';
import Dimension, { DimensionType } from './dimension';
import { Annotations } from './annotations';
import NamedSet from './namedSet';
import Query from './query';

export default class Cube {
    clientKey : string;
    key: string;
    name: string;
    caption: string;
    dimensions: Dimension[];
    namedSets: NamedSet[];
    measures: Measure[];
    annotations: Annotations = {};

    dimensionsByName: { [d: string]: Dimension };

    constructor(clientKey: string,
                name: string,
                dimensions: Dimension[],
                namedSets: NamedSet[],
                measures: Measure[],
                annotations: Annotations) {

        this.clientKey = clientKey;
        this.key = unique(`${clientKey} ${name}`);
        this.name = name;
        this.caption = this.annotations['caption'] || name;
        this.measures = measures;
        this.dimensions = dimensions.map((d) => Object.assign(d, { cube: this }));
        this.namedSets = namedSets;
        this.annotations = annotations;

        this.dimensionsByName = this.dimensions.reduce((m: {}, d: Dimension): {} => {
            m[d.name] = d;
            return m;
        }, {});
    }

    static fromJSON(clientKey: string, json: any): Cube {
        if (!json['named_sets']) json['named_sets'] = [];

        const dimensions: Dimension[] = json['dimensions'].map(Dimension.fromJSON);

        return new Cube(clientKey,
                        json['name'],
                        dimensions,
                        json['named_sets'].map(ns => {
                            return new NamedSet(ns['name'],
                                                dimensions
                                                  .find(d => d.name == ns['dimension'])
                                                  .getHierarchy(ns['hierarchy'])
                                                  .getLevel(ns['level']),
                                                ns['annotations']);
                        }),
                        json['measures'].map(Measure.fromJSON),
                        json['annotations']);
    }

    get standardDimensions(): Dimension[] {
        return this.dimensions.filter((d) => d.dimensionType === DimensionType.Standard);
    }


    get timeDimension(): Dimension {
        const tds = this.dimensions.filter((d) => d.dimensionType === DimensionType.Time);
        return tds.length > 0 ? tds[0] : null;
    }

    get defaultMeasure(): Measure {
        const dm = this.measures.filter((m) => m.annotations['default']);
        return dm.length > 0 ? dm[0] : this.measures[0];
    }

    findMeasure(measureName: string): Measure {
        const ms = this.measures.filter((m) => m.name === measureName);
        if (ms.length === 0) {
            throw new Error(`Measure ${measureName} does not exist in cube ${this.name}`);
        }
        return ms[0];
    }

    findNamedSet(namedSetName: string): NamedSet {
        const ns = this.namedSets.find(ns => ns.name === namedSetName);
        if (ns === undefined) {
            throw new Error(`NamedSet ${namedSetName} does not exist in cube ${this.name}`);
        }
        return ns;
    }

    get query(): Query {
        return new Query(this);
    }
}
