import urljoin from "url-join";
import {Named, Serializable} from "./interfaces";
import Level from "./level";

class Member implements Named, Serializable {
  readonly allMember: boolean;
  readonly ancestors: Member[];
  readonly caption?: string;
  readonly children: Member[];
  readonly depth: number;
  readonly drillable: boolean;
  readonly fullname: string;
  readonly isMember: boolean = true;
  readonly key: string;
  level: Level;
  readonly name: string;
  readonly numChildren: number;
  readonly parentName: string;

  constructor(
    key: string,
    name: string,
    fullname: string,
    caption: string,
    allMember: boolean,
    drillable: boolean,
    depth: number,
    numChildren: number,
    children: Member[],
    ancestors: Member[],
    parentName: string
  ) {
    this.name = name;
    this.fullname = fullname;
    this.caption = caption;
    this.allMember = allMember;
    this.drillable = drillable;
    this.depth = depth;
    this.key = key;
    this.numChildren = numChildren;
    this.children = children;
    this.ancestors = ancestors;
    this.parentName = parentName;
  }

  static fromJSON(json: any): Member {
    return new Member(
      json["key"],
      json["name"],
      json["full_name"],
      json["caption"],
      json["all_member?"],
      json["drillable?"],
      json["depth"],
      json["num_children"],
      (json["children"] || []).map(Member.fromJSON),
      (json["ancestors"] || []).map(Member.fromJSON),
      json["parent_name"]
    );
  }

  static isMember(obj: any): obj is Member {
    return Boolean(obj && obj.isMember);
  }

  get fullnameParts(): string[] {
    return this.level.fullnameParts.concat(this.key);
  }

  toJSON(): any {
    return {
      caption: this.caption,
      fullname: this.fullname,
      key: this.key,
      name: this.name,
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(this.level.toString(), "members", this.key);
  }
}

export default Member;
