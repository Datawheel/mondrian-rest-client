import { Annotations } from './annotations';
import { Level } from './dimension';

export default class NamedSet {
    name: string;
    level: Level;
    annotations: Annotations;

    constructor(name: string, level: Level, annotations: Annotations) {
        this.name = name;
        this.level = level;
        this.annotations = annotations;
    }

    get fullName(): string {
        return this.name;
    }
}
