import urljoin from "url-join";
import {AggregatorType} from "./common";
import Cube from "./cube";
import {ClientError} from "./errors";
import {Annotated, Annotations, CubeChild, Named, Serializable} from "./interfaces";

class Measure implements Annotated, CubeChild, Named, Serializable {
  public aggregatorType: AggregatorType;
  public annotations: Annotations = {};
  public caption?: string;
  public cube: Cube;
  public fullname: string;
  public name: string;

  private readonly isMeasure: boolean = true;

  constructor(
    name: string,
    annotations: Annotations,
    aggregatorType: AggregatorType,
    caption: string,
    fullname: string
  ) {
    this.aggregatorType = aggregatorType;
    this.annotations = annotations;
    this.caption = caption;
    this.fullname = fullname;
    this.name = name;
  }

  static fromJSON(json: any): Measure {
    return new Measure(
      json["name"],
      json["annotations"],
      json["aggregator"] || AggregatorType.UNKNOWN,
      json["caption"],
      json["full_name"]
    );
  }

  static isMeasure(obj: any): obj is Measure {
    return Boolean(obj && obj.isMeasure);
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new ClientError(`Annotation ${key} does not exist in measure ${this.name}.`);
    }
    return defaultValue;
  }

  toJSON(): any {
    return {
      aggregator: this.aggregatorType,
      annotations: this.annotations,
      fullname: this.fullname,
      name: this.name,
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(this.cube.toString(), `#/measures/${encodeURIComponent(this.name)}`);
  }
}

export default Measure;
