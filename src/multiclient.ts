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

    getClientByCube(cube: Cube): Promise<Client> {
        let client = this.clientMap.get(cube);
        if (client !== undefined) {
            return Promise.resolve(client);
        }
        else {
            return this.findClientByCube(cube);
        }
    }

    findClientByCube(cube: Cube): Promise<Client> {
        const clientMap = this.clientMap;

        const clientTests = this.clientList.map(client =>
            client.cubes().then(cubes => {
                if (cubes.indexOf(cube) > -1) {
                    clientMap.set(cube, client);
                    return client;
                }
                return null;
            })
        );

        return Promise.all(clientTests).then(results => results.find(Boolean));
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
                throw new MultiClientError(`A cube named "${cubeName}" is present in more than one server.`);
            }
            return matches.length === 1 ? matches[0] : sorter(matches, clients);
        });
    }

    query(query: Query, format?: string, method?: string): Promise<Aggregation> {
        const cube: Cube = query.cube;
        return this.getClientByCube(cube).then(client =>
            client.query(query, format, method)
        );
    }

    members(level: Level, getChildren?: boolean, caption?: string): Promise<Member[]> {
        const cube: Cube = level.hierarchy.dimension.cube;
        return this.getClientByCube(cube).then(client =>
            client.members(level, getChildren, caption)
        );
    }

    member(level: Level, key: string, getChildren?: boolean, caption?: string): Promise<Member> {
        const cube: Cube = level.hierarchy.dimension.cube;
        return this.getClientByCube(cube).then(client =>
            client.member(level, key, getChildren, caption)
        );
    }
}
