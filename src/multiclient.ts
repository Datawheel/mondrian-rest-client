import Aggregation from "./aggregation";
import Client from "./client";
import Cube from "./cube";
import Member from "./member";
import Query from "./query";
import { Level } from "./dimension";

class MondrianMultiClientError extends Error {
    public readonly body: any;
    public readonly error: any;

    constructor(message: string) {
        super();
        this.message = message;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, MondrianMultiClientError.prototype);
    }
}

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
        const clientList: Client[] = this.clientList;

        const clientTests = clientList.map(client => {
            return client.cubes().then(cubes => {
                return cubes.some(cb => cb === cube);
            });
        });

        return Promise.all(clientTests).then(testResults => {
            const index = testResults.indexOf(true);
            if (index > -1) {
                const client = clientList[index];
                clientMap.set(cube, client);
                return client;
            }
            throw new MondrianMultiClientError(
                "Invalid Cube for the current list of Clients."
            );
        });
    }

    cubes(): Promise<Cube[]> {
        const promiseCubeList = this.clientList.map(client => client.cubes());
        return Promise.all(promiseCubeList).then(cubeList =>
            [].concat(...cubeList)
        );
    }

    cube(cubeName: string): Promise<Cube> {
        return this.cubes().then(cubes => cubes.find(cube => cube.name === cubeName));
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
