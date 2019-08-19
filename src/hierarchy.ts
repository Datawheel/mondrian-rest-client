import urljoin from "url-join";
import Cube from "./cube";
import Dimension from "./dimension";
import {Annotations, CubeChild, Named, Serializable} from "./interfaces";
import Level from "./level";
import {Annotated, applyMixins} from "./mixins";

class Hierarchy implements CubeChild, Named, Serializable {
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

interface Hierarchy extends Annotated {}

applyMixins(Hierarchy, [Annotated]);

export default Hierarchy;
