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
    children: Member[];
    ancestors: Member[];
    constructor(name: string, fullName: string, caption: string, allMember: boolean, drillable: boolean, depth: number, key: string, numChildren: number, children: Member[], ancestors: Member[], parentName: string);
    static fromJSON(json: {}): Member;
}
