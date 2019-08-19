import urljoin from "url-join";
import {DimensionType, splitFullname} from "./common";
import Dimension from "./dimension";
import {ClientError} from "./errors";
import {Annotations, CubeChild, Named, Serializable} from "./interfaces";
import Level from "./level";
import Measure from "./measure";
import {Annotated, applyMixins} from "./mixins";
import NamedSet from "./namedset";
import Query from "./query";

class Cube implements Named, Serializable {
  readonly annotations: Annotations = {};
  readonly dimensions: Dimension[];
  readonly dimensionsByName: {[name: string]: Dimension} = {};
  readonly isCube: boolean = true;
  readonly measures: Measure[];
  readonly measuresByName: {[name: string]: Measure} = {};
  readonly name: string;
  readonly namedsets: NamedSet[];
  readonly namedsetsByName: {[name: string]: NamedSet} = {};
  server: string = "/";

  constructor(
    name: string,
    annotations: Annotations,
    dimensions: Dimension[],
    measures: Measure[],
    namedsets: NamedSet[]
  ) {
    this.annotations = annotations || {};
    this.dimensions = dimensions;
    this.measures = measures;
    this.name = name;
    this.namedsets = namedsets;

    dimensions.forEach(dim => {
      dim.cube = this;
      this.dimensionsByName[dim.name] = dim;
    });
    measures.forEach(msr => {
      msr.cube = this;
      this.measuresByName[msr.name] = msr;
    });
    namedsets.forEach(nst => {
      this.namedsetsByName[nst.name] = nst;
    });
  }

  static fromJSON(json: any): Cube {
    const dimensions: Dimension[] = json["dimensions"].map(Dimension.fromJSON);
    const namedSets = (json["named_sets"] || []).map((ns: any) => {
      const namedSet = NamedSet.fromJSON(ns);
      const dim = dimensions.find(d => d.name == ns.dimension);
      const hie = dim.findHierarchy(ns.hierarchy);
      namedSet.level = hie.findLevel(ns.level);
      return namedSet;
    });

    return new Cube(
      json["name"],
      json["annotations"],
      dimensions,
      json["measures"].map(Measure.fromJSON),
      namedSets
    );
  }

  static isCube(obj: any): obj is Cube {
    return Boolean(obj && obj.isCube);
  }

  get caption(): string {
    return this.annotations.caption || this.name;
  }

  get defaultMeasure(): Measure {
    // TODO: verify this is the way this annotation works
    return this.measures.find(m => m.annotations["default"]) || this.measures[0];
  }

  get fullname(): string {
    return this.name;
  }

  get query(): Query {
    return new Query(this);
  }

  get fullnameParts(): string[] {
    return [this.name];
  }

  get standardDimensions(): Dimension[] {
    return this.findDimensionsByType(DimensionType.Standard);
  }

  get timeDimension(): Dimension {
    return this.dimensions.find(
      d => d.dimensionType === DimensionType.Time || d.annotations.dim_type === "TIME"
    );
  }

  get geoDimension(): Dimension {
    return this.dimensions.find(d => d.annotations.dim_type === "GEOGRAPHY");
  }

  findDimensionsByType(type: DimensionType): Dimension[] {
    return this.dimensions.filter(d => d.dimensionType === type);
  }

  findLevel(levelName: string, elseFirst?: boolean): Level {
    const dimensions = this.dimensions;
    const count = dimensions.length;
    for (let i = 0; i < count; i++) {
      const level = dimensions[i].findLevel(levelName);
      if (level) {
        return level;
      }
    }
    return elseFirst === true ? dimensions[0].hierarchies[0].levels[1] : null;
  }

  getDimension(dimIdentifier: string | Dimension): Dimension {
    const dimension = Dimension.isDimension(dimIdentifier)
      ? dimIdentifier
      : this.dimensionsByName[dimIdentifier];

    if (!Dimension.isDimension(dimension)) {
      throw new ClientError(`Object ${dimIdentifier} is not a valid dimension identifier`);
    }

    return this.verifyOwnership(dimension);
  }

  getLevel(lvlIdentifier: string | string[] | Level): Level {
    const level = Level.isLevel(lvlIdentifier)
      ? lvlIdentifier
      : this.queryFullname(lvlIdentifier);

    if (!Level.isLevel(level)) {
      throw new ClientError(`Object ${level} is not a valid level, found using ${lvlIdentifier}`);
    }

    return this.verifyOwnership(level);
  }

  getMeasure(msrIdentifier: string | Measure): Measure {
    const measure = Measure.isMeasure(msrIdentifier)
      ? msrIdentifier
      : this.measuresByName[msrIdentifier];

    if (!Measure.isMeasure(measure)) {
      throw new ClientError(`Object ${msrIdentifier} is not a valid measure identifier`);
    }

    return this.verifyOwnership(measure);
  }

  getNamedSet(nstIdentifier: string | NamedSet): NamedSet {
    const namedset = NamedSet.isNamedset(nstIdentifier)
      ? nstIdentifier
      : this.namedsetsByName[nstIdentifier];

    if (!NamedSet.isNamedset(namedset)) {
      throw new ClientError(`Object ${nstIdentifier} is not a valid namedset identifier`);
    }

    return this.verifyOwnership(namedset);
  }

  queryFullname(fullname: string | string[]): any {
    const nameParts =
      typeof fullname === "string" ? splitFullname(fullname) : fullname.slice();

    const name = nameParts[0];
    if (name === "Measures") {
      return this.measuresByName[nameParts[1]];
    }
    if (nameParts.length === 1) {
      if (name in this.measuresByName) {
        return this.measuresByName[name];
      }
      else if (name in this.dimensionsByName) {
        return this.dimensionsByName[name];
      }
      else if (name in this.namedsetsByName) {
        return this.namedsetsByName[name];
      }
    }
    else {
      const dimName = nameParts.shift();
      const dimension = this.dimensionsByName[dimName];

      if (dimension) {
        const hieName = nameParts.shift();
        const hierarchy =
          dimension.findHierarchy(hieName) || dimension.findHierarchy(dimName);

        if (hierarchy) {
          const lvlName = nameParts.shift() || hieName;
          const level = hierarchy.findLevel(lvlName);

          if (level) {
            const nstName = nameParts.shift();
            return this.namedsetsByName[nstName] || level;
          }
          return hierarchy;
        }
        return dimension;
      }
    }
  }

  toJSON(): any {
    const serialize = (obj: Serializable) => obj.toJSON();
    return {
      annotations: this.annotations,
      dimensions: this.dimensions.map(serialize),
      measures: this.measures.map(serialize),
      name: this.name,
      namedsets: this.namedsets.map(serialize),
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(this.server, "cubes", encodeURIComponent(this.name));
  }

  private verifyOwnership<T extends CubeChild>(obj: T): T {
    if (!obj || obj.cube !== this) {
      throw new ClientError(`Object ${obj} does not belong to cube ${this.name}`);
    }
    return obj;
  }
}

interface Cube extends Annotated {}

applyMixins(Cube, [Annotated]);

export default Cube;
