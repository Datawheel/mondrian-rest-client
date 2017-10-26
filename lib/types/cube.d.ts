import Measure from './measure';
import Dimension from './dimension';
import { Annotations } from './annotations';
import NamedSet from './namedSet';
import Query from './query';
export default class Cube {
    name: string;
    caption: string;
    dimensions: Dimension[];
    namedSets: NamedSet[];
    measures: Measure[];
    annotations: Annotations;
    dimensionsByName: {
        [d: string]: Dimension;
    };
    constructor(name: string, dimensions: Dimension[], namedSets: NamedSet[], measures: Measure[], annotations: Annotations);
    static fromJSON(json: {}): Cube;
    readonly standardDimensions: Dimension[];
    readonly timeDimension: Dimension;
    readonly defaultMeasure: Measure;
    findMeasure(measureName: string): Measure;
    findNamedSet(namedSetName: string): NamedSet;
    readonly query: Query;
}
