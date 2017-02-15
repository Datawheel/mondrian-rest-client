import { Annotations } from './annotations';

export default class Measure {

    name: string;
    caption: string;
    fullName: string;
    annotations: Annotations = {};

    constructor(name: string, caption: string, fullName: string, annotations: Annotations) {
        this.name = name;
        this.caption = caption;
        this.fullName = fullName;
        this.annotations = annotations;
    }

    static fromJSON(json: {}): Measure {
        const m: Measure = new Measure(json['name'], json['caption'], json['full_name'], json['annotations']);
        return m;
    }

}
