export default class Member {
    name: string;
    fullName: string;
    caption: string;
    allMember: boolean;
    drillable: boolean;
    depth: number;
    key: string;
    numChildren: number;
    parentName: string;

    constructor(name: string, fullName: string, caption: string, allMember: boolean,
        drillable: boolean, depth: number, key: string,
        numChildren: number, parentName: string) {

        this.name = name;
        this.fullName = fullName;
        this.caption = caption;
        this.allMember = allMember;
        this.drillable = drillable;
        this.depth = depth;
        this.key = key;
        this.numChildren = numChildren;
        this.parentName = parentName;
    }

    static fromJSON(json: {}): Member {
        return new Member(json['name'], json['full_name'], json['caption'], json['all_member?'], json['drillable?'], json['depth'], json['key'], json['num_children'], json['parent_name']);
    }
}
