import { Annotations } from './annotations';

export enum AggregatorType {
    AVG = "AVG",
    COUNT = "COUNT",
    MAX = "MAX",
    MIN = "MIN",
    SUM = "SUM",
    UNKNOWN = "UNKNOWN"
}

export default class Measure {

    name: string;
    caption: string;
    fullName: string;
    annotations: Annotations = {};
    aggregatorType: AggregatorType;

    constructor(name: string, caption: string, fullName: string, annotations: Annotations, aggregatorType: AggregatorType) {
        this.name = name;
        this.caption = caption;
        this.fullName = fullName;
        this.annotations = annotations;
        this.aggregatorType = aggregatorType;
    }

    static fromJSON(json: {}): Measure {
        const m: Measure = new Measure(json['name'], json['caption'], json['full_name'], json['annotations'], json['aggregator']);
        return m;
    }

}
