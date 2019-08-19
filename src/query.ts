import formUrlEncoded from "form-urlencoded";
import urljoin from "url-join";
import {
  AllowedComparison,
  AllowedFormat,
  pushUnique,
  parseCut,
  splitFullname,
  stringifyCut
} from "./common";
import Cube from "./cube";
import {ClientError} from "./errors";
import {CubeChild, Drillable, QueryOptions, Serializable} from "./interfaces";
import Level from "./level";
import Measure from "./measure";
import Member from "./member";

class Query implements CubeChild, Serializable {
  readonly cube: Cube;
  readonly captions: string[] = [];
  readonly cuts: {[drillable: string]: string[]} = {};
  readonly drilldowns: string[] = [];
  readonly filters: string[] = [];
  limit: number;
  readonly measures: string[] = [];
  offset: number;
  orderDescendent: boolean;
  orderProperty: string;
  readonly properties: string[] = [];

  private options: QueryOptions = {
    debug: false,
    distinct: false,
    nonempty: true,
    parents: false,
    sparse: true
  };

  constructor(cube: Cube) {
    this.cube = cube;
  }

  get aggregateObject(): any {
    const cuts = Object.keys(this.cuts)
      .map(drillable => stringifyCut(drillable, this.cuts[drillable]))
      .filter(Boolean);
    return {
      ...this.options,
      captions: this.captions.length ? this.captions : undefined,
      cuts: cuts.length ? cuts : undefined,
      drilldown: this.drilldowns.length ? this.drilldowns : undefined,
      filter: this.filters.length ? this.filters : undefined,
      limit: this.limit,
      measures: this.measures.length ? this.measures : undefined,
      offset: this.offset,
      order_desc: this.orderDescendent,
      order: this.orderProperty,
      properties: this.properties.length ? this.properties : undefined
    };
  }

  get logicLayerObject(): any {
    console.warn("mondrian-rest does not support server-side Logic Layer.");
    return undefined;
  }

  addCaption(level: string | Level, property: string): Query {
    const propertyFullname = this.getProperty(level, property);
    this.captions.push(propertyFullname);
    return this;
  }

  addCut(cut: string | Level, memberList: string[] | Member[] = []): Query {
    let drillable: Drillable, members: string[];
    const memberToString = (member: string | Member): string =>
      Member.isMember(member) ? member.key : member;

    if (Level.isLevel(cut) || memberList.length > 0) {
      drillable = this.cube.getLevel(cut);
    }
    else {
      if (!/[^,{}]+\]\.&\[[^,{}]+/gi.test(cut)) {
        throw new ClientError(`Invalid cut: ${cut}`);
      }
      const [parsedDrillable, parsedMembers] = parseCut(cut);
      drillable = this.cube.getLevel(parsedDrillable);
      const normalizedMembers = Array.from(memberList, memberToString);
      parsedMembers.forEach(member => pushUnique(normalizedMembers, member));
      memberList = normalizedMembers;
    }

    members = this.cuts[drillable.fullname] || [];
    memberList.forEach((member: string | Member) =>
      pushUnique(members, memberToString(member))
    );
    this.cuts[drillable.fullname] = members;

    return this;
  }

  addDrilldown(lvlIdentifier: string | Level): Query {
    const level = this.cube.getLevel(lvlIdentifier);
    pushUnique(this.drilldowns, level.fullname);
    return this;
  }

  addFilter(
    msrIdentifier: string | Measure,
    comparison: AllowedComparison,
    value: number
  ): Query {
    const measure = this.cube.getMeasure(msrIdentifier);
    const filter = `${measure.name} ${comparison} ${value}`;
    pushUnique(this.filters, filter);
    return this;
  }

  addMeasure(msrIdentifier: string | Measure): Query {
    const measure = this.cube.getMeasure(msrIdentifier);
    pushUnique(this.measures, measure.name);
    return this;
  }

  addProperty(lvlIdentifier: string | Level, propertyName: string): Query {
    const property = this.getProperty(lvlIdentifier, propertyName);
    if (property) {
      pushUnique(this.properties, property);
    }
    return this;
  }

  getOptions(): QueryOptions {
    return {...this.options};
  }

  getAggregateUrl(format?: AllowedFormat): string {
    const dotFormat = format ? `.${format}` : "";
    const parameters = formUrlEncoded(this.aggregateObject, {
      ignorenull: true,
      skipIndex: true,
      sorted: true
    });
    return urljoin(this.cube.toString(), `aggregate${dotFormat}?${parameters}`);
  }

  getLogicLayerUrl(): string {
    console.warn("mondrian-rest doesn't support server-side Logic Layer urls");
    return "";
  }

  private getProperty(lvlIdentifier: string | Level, propertyName?: string): string {
    let level: Level;

    if (typeof lvlIdentifier === "string") {
      const nameParts = splitFullname(lvlIdentifier);
      if (!propertyName) {
        propertyName = nameParts.pop();
      }
      level = this.cube.getLevel(nameParts);
    }
    else {
      level = this.cube.getLevel(lvlIdentifier);
    }

    if (!level.hasProperty(propertyName)) {
      throw new ClientError(`Property ${propertyName} does not exist in level ${level.fullname}`);
    }

    return `${level.fullname}.${propertyName}`;
  }

  setGrowth(): Query {
    console.warn("mondrian-rest doesn't support growth calculations.");
    return this;
  }

  setOption(option: keyof QueryOptions, value: boolean): Query {
    if (!this.options.hasOwnProperty(option)) {
      throw new ClientError(`Option ${option} is not a valid option.`);
    }
    this.options[option] = value;
    return this;
  }

  setPagination(limit: number, offset: number): Query {
    if (limit > 0) {
      this.limit = limit;
      this.offset = offset || 0;
    }
    else {
      this.limit = undefined;
      this.offset = undefined;
    }
    return this;
  }

  setRCA(): Query {
    console.warn("mondrian-rest doesn't support RCA calculations.");
    return this;
  }

  setSorting(msrIdentifier: string | Measure, direction: boolean) {
    if (Measure.isMeasure(msrIdentifier)) {
      this.orderProperty = msrIdentifier.name;
      this.orderDescendent = direction;
    }
    else {
      const measure = this.cube.measuresByName[msrIdentifier];
      this.orderProperty = measure ? measure.name : this.getProperty(msrIdentifier);
      this.orderDescendent = direction;
    }
    return this;
  }

  setTop(): Query {
    console.warn("mondrian-rest doesn't support top item calculations.");
    return this;
  }

  toJSON(): any {
    const serverUrl = this.cube.server;
    return {
      serverUrl,
      aggregatePath: this.getAggregateUrl().replace(serverUrl, ""),
      logicLayerPath: "",
      cube: this.cube.name,
      ...this.aggregateObject
    };
  }

  toString(): string {
    return this.getAggregateUrl();
  }
}

export default Query;
