import {Annotations} from "./interfaces";
import {ClientError} from "./errors";

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
      );
    });
  });
}

export class Annotated {
  annotations: Annotations = {};
  name: string;

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new ClientError(
        `Annotation ${key} does not exist in ${this.constructor.name} ${this.name}.`
      );
    }
    return defaultValue;
  }
}
