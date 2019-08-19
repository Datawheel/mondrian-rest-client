import urljoin from "url-join";
import Cube from "./cube";
import Dimension from "./dimension";
import {ClientError} from "./errors";
import {Annotated, Annotations, CubeChild, Named, Serializable} from "./interfaces";
import Level from "./level";

class Hierarchy implements Annotated, CubeChild, Named, Serializable {
  readonly allMemberName: string;
  readonly annotations: Annotations;
  dimension: Dimension;
  readonly isHierarchy: boolean = true;
  readonly levels: Level[];
  readonly name: string;

  constructor(
    name: string,
    annotations: Annotations,
    levels: Level[],
    allMemberName: string
  ) {
    this.allMemberName = allMemberName;
    this.annotations = annotations || {};
    this.levels = levels;
    this.name = name;

    levels.forEach(lvl => {
      lvl.hierarchy = this;
    });
  }

  static fromJSON(json: any): Hierarchy {
    return new Hierarchy(
      json["name"],
      json["annotations"],
      json["levels"].map(Level.fromJSON),
      json["all_member_name"]
    );
  }

  static isHierarchy(obj: any): obj is Hierarchy {
    return Boolean(obj && obj.isHierarchy);
  }

  get cube(): Cube {
    return this.dimension.cube;
  }

  get fullname(): string {
    return `${this.dimension.fullname}.[${this.name}]`;
  }

  get fullnameParts(): string[] {
    return this.dimension.fullnameParts.concat(this.name);
  }

  findLevel(levelName: string, elseFirst?: boolean): Level {
    const levels = this.levels;
    const count = levels.length;
    for (let i = 0; i < count; i++) {
      if (levels[i].name === levelName) {
        return levels[i];
      }
    }
    return elseFirst === true ? levels[0] : null;
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new ClientError(`Annotation ${key} does not exist in hierarchy ${this.fullname}.`);
    }
    return defaultValue;
  }

  toJSON(): any {
    const serialize = (obj: Serializable) => obj.toJSON();
    return {
      annotations: this.annotations,
      fullname: this.fullname,
      levels: this.levels.map(serialize),
      name: this.name,
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(
      this.dimension.toString(),
      "hierarchies",
      encodeURIComponent(this.name)
    );
  }
}

export default Hierarchy;
