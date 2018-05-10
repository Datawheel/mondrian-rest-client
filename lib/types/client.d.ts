import Cube from './cube';
import Query from './query';
import Aggregation from './aggregation';
import Member from './member';
import { Level } from './dimension';
export default class Client {
    private api_base;
    private cubesCache;
    private cubeCache;
    constructor(api_base: string);
    cubes(): Promise<Cube[]>;
    cube(name: string): Promise<Cube>;
    query(query: Query, format?: string, method?: string): Promise<Aggregation>;
    members(level: Level, getChildren?: boolean, caption?: string): Promise<Member[]>;
    member(level: Level, key: string, getChildren?: boolean, caption?: string): Promise<Member>;
}
