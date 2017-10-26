import { Annotations } from './annotations';
import { Level } from './dimension';
export default class NamedSet {
    name: string;
    level: Level;
    annotations: Annotations;
    constructor(name: string, level: Level, annotations: Annotations);
    readonly fullName: string;
}
