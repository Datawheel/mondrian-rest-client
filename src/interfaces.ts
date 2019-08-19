import Cube from "./cube";

export interface Aggregation {
  data: any[];
  url: string;
  options: QueryOptions;
}

export interface Annotated {
  annotations: Annotations;
  getAnnotation(key: string, defaultValue?: string): string;
  name: string;
}

export interface Annotations {
  [key: string]: string;
}

export interface CubeChild {
  cube: Cube;
}

export interface Drillable extends CubeChild, Named {
  readonly isDrillable: boolean;
}

export interface Named {
  name: string;
  fullname: string;
  fullnameParts: string[];
}

export interface Property {
  annotations: Annotations;
  name: string;
}

export interface QueryOptions {
  debug?: boolean;
  distinct?: boolean;
  nonempty?: boolean;
  parents?: boolean;
  sparse?: boolean;
}

export interface Serializable {
  toJSON(): any;
}

export interface ServerStatus {
  software: string;
  status: string;
  url: string;
  version: string;
}
