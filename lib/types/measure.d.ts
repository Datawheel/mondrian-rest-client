import { Annotations } from './annotations';
export declare enum AggregatorType {
    AVG = "AVG",
    COUNT = "COUNT",
    MAX = "MAX",
    MIN = "MIN",
    SUM = "SUM",
    UNKNOWN = "UNKNOWN",
}
export default class Measure {
    name: string;
    caption: string;
    fullName: string;
    annotations: Annotations;
    aggregatorType: AggregatorType;
    constructor(name: string, caption: string, fullName: string, annotations: Annotations, aggregatorType: AggregatorType);
    static fromJSON(json: {}): Measure;
}
