import urljoin from "url-join";
import Cube from "./cube";
import {Annotations, CubeChild, Named, Serializable} from "./interfaces";
import Level from "./level";
import {Annotated, applyMixins} from "./mixins";

class NamedSet implements CubeChild, Named, Serializable {
  readonly annotations: Annotations;
  readonly isNamedset: boolean = true;
  level: Level;
  readonly name: string;

  constructor(name: string, annotations: Annotations) {
    this.annotations = annotations || {};
    this.name = name;
  }

  static fromJSON(json: any): NamedSet {
    return new NamedSet(json["name"], json["annotations"]);
  }

  static isNamedset(obj: any): obj is NamedSet {
    return Boolean(obj && obj.isNamedset);
  }

  get cube(): Cube {
    return this.level.cube;
  }

  get fullname(): string {
    return `${this.level.fullname}.[${this.name}]`;
  }

  get fullnameParts(): string[] {
    return this.level.fullnameParts.concat(this.name);
  }

  toJSON(): any {
    return {
      annotations: this.annotations,
      level: this.level.fullname,
      name: this.name
    };
  }

  toString(): string {
    return urljoin(this.level.toString(), `#/namedsets/${encodeURIComponent(this.name)}`);
  }
}

interface NamedSet extends Annotated {}

applyMixins(NamedSet, [Annotated]);

export default NamedSet;
