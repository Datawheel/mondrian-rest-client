export enum AggregatorType {
  AVG = "AVG",
  COUNT = "COUNT",
  MAX = "MAX",
  MIN = "MIN",
  SUM = "SUM",
  UNKNOWN = "UNKNOWN"
}

export enum AllowedComparison {
  eq = "=",
  gt = ">",
  gte = ">=",
  lt = "<",
  lte = "<=",
  neq = "<>"
}

export enum AllowedFormat {
  csv = "csv",
  json = "json",
  jsonrecords = "jsonrecords",
  xls = "xls"
}

export enum AllowedOrder {
  asc = "asc",
  desc = "desc"
}

export enum DimensionType {
  Geographic = "std",
  Standard = "std",
  Time = "time"
}

export function joinFullname(nameParts: string[]): string {
  return nameParts.map((token: string) => `[${token}]`).join(".");
}

export function parseCut(cut: string): [string, string[]] {
  cut = `${cut}`.replace(/^\{|\}$/g, "");
  const drillable = cut.split(".&", 1).shift();
  const members = cut
    .split(",")
    .map((member: string) => member.split(".&").pop().replace(/^\[|\]$/g, ""));
  return [drillable, members];
}

export function pushUnique<T>(target: T[], item: T) {
  return target.indexOf(item) === -1 ? target.push(item) : target.length;
}

export function rangeify(list: number[]) {
  const groups: {
    [diff: string]: number[];
  } = list.sort().reduce((groups: any[], item: number, i: number) => {
    const diff = item - i;
    groups[diff] = groups[diff] || [];
    groups[diff].push(item);
    return groups;
  }, {});
  return Object.keys(groups).map(diff => {
    const group = groups[diff];
    return group.length > 1 ? [group[0], group[group.length - 1]] : group[0];
  });
}

export function splitFullname(fullname: string) {
  return fullname ? `${fullname}`.replace(/^\[|\]$/g, "").split(/\]\.\[?/) : undefined;
}

export function stringifyCut(drillable: string, members: string[] = []) {
  const cut = members.map((member: string) => `${drillable}.&[${member}]`).join(",");
  return members.length === 0 ? undefined : members.length > 1 ? `{${cut}}` : cut;
}

export const FORMATS: {readonly [K in AllowedFormat]: string} = {
  [AllowedFormat.csv]: "text/csv",
  [AllowedFormat.json]: "application/json",
  [AllowedFormat.jsonrecords]: "application/x-jsonrecords",
  [AllowedFormat.xls]: "application/vnd.ms-excel"
};

export const MAX_GET_URI_LENGTH = 2000;
