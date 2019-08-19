import urljoin from "url-join";
import Cube from "./cube";
import {ClientError} from "./errors";
import {Annotated, Annotations, CubeChild, Named, Serializable} from "./interfaces";
import Level from "./level";

class NamedSet implements Annotated, CubeChild, Named, Serializable {
  public annotations: Annotations;
  public level: Level;
  public name: string;

  private readonly isNamedset: boolean = true;

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

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new ClientError(`Annotation ${key} does not exist in namedset ${this.fullname}.`);
    }
    return defaultValue;
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

export default NamedSet;
