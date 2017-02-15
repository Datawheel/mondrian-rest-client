import Measure from './measure';
import Dimension, { DimensionType } from './dimension';
import { Annotations } from './annotations';
import Query from './query';

export default class Cube {

    name: string;
    caption: string;
    dimensions: Dimension[];
    measures: Measure[];
    annotations: Annotations = {};

    dimensionsByName: { [d: string]: Dimension };

    constructor(name: string,
        dimensions: Dimension[],
        measures: Measure[],
        annotations: Annotations) {

        this.name = name;
        this.caption = this.annotations['caption'] || name;
        this.measures = measures;
        this.dimensions = dimensions;

        this.dimensionsByName = dimensions.reduce((m: {}, d: Dimension): {} => {
            m[d.name] = d;
            return m;
        }, {});
    }

    static fromJSON(json: {}): Cube {
        const c: Cube = new Cube(json['name'],
            json['dimensions'].map(Dimension.fromJSON),
            json['measures'].map(Measure.fromJSON),
            json['annotations']);
        return c;
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

    get query(): Query {
        return new Query(this);
    }
}
