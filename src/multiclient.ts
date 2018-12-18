import Aggregation from './aggregation';
import Client from './client';
import Cube from './cube';
import { Level } from './dimension';
import { MultiClientError } from './errors';
import Member from './member';
import Query from './query';

export default class MultiClient {
    private clientList: Client[];
    private clientMap: WeakMap<Cube, Client> = new WeakMap();

    constructor(api_list: string[]) {
        this.clientList = api_list.map(api_base => new Client(api_base));
    }

    getClientByCube(cube: Cube): Client {
        return this.clientMap.get(cube) || this.findClientByCube(cube);
    }

    findClientByCube(cube: Cube): Client {
        const clientMap = this.clientMap;
        const client = this.clientList.find(client => client.key === cube.clientKey);
        clientMap.set(cube, client);
        return client;
    }

    cubes(): Promise<Cube[]> {
        const promiseCubeList = this.clientList.map(client => client.cubes());
        return Promise.all(promiseCubeList).then(cubeList =>
            [].concat.apply([], cubeList)
        );
    }

    cube(cubeName: string, sorter: (matches: Cube[], clients: Client[]) => Cube): Promise<Cube> {
        const clients = this.clientList.slice();
        return this.cubes().then(cubes => {
            const matches = cubes.filter(cube => cube.name === cubeName);
            if (!sorter && matches.length > 1) {
                throw new MultiClientError(
                    `A cube named '${cubeName}' is present in more than one server.`
                );
            }
            return matches.length === 1 ? matches[0] : sorter(matches, clients);
        });
    }

    query(query: Query, format?: string, method?: string): Promise<Aggregation> {
        const cube: Cube = query.cube;
        const client = this.getClientByCube(cube);
        return client.query(query, format, method);
    }

    members(level: Level, getChildren?: boolean, caption?: string): Promise<Member[]> {
        const cube: Cube = level.hierarchy.dimension.cube;
        const client = this.getClientByCube(cube);
        return client.members(level, getChildren, caption);
    }

    member(level: Level, key: string, getChildren?: boolean, caption?: string): Promise<Member> {
        const cube: Cube = level.hierarchy.dimension.cube;
        const client = this.getClientByCube(cube);
        return client.member(level, key, getChildren, caption);
    }
}
