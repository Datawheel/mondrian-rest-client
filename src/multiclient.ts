import Client from "./client";
import {AllowedFormat} from "./common";
import Cube from "./cube";
import {ClientError} from "./errors";
import {Aggregation, ServerStatus} from "./interfaces";
import Level from "./level";
import Member from "./member";
import Query from "./query";

class MultiClient {
  private clients: {[server: string]: Client} = {};

  constructor(serverUrls: string[]) {
    const clients = this.clients;
    [].concat(serverUrls).forEach(server => {
      if (server) {
        clients[server] = new Client(server);
      }
    });
  }

  get clientList() {
    const clients = this.clients;
    return Object.keys(clients).map(server => clients[server]);
  }

  checkStatus(): Promise<{[server: string]: ServerStatus | Error}> {
    const statusMap: {[server: string]: ServerStatus | Error} = {};
    const tasks = this.clientList.map((client: Client) => {
      const saveResult = (result: ServerStatus | Error) => {
        statusMap[client.baseUrl] = result;
      };
      return client.checkStatus().then(saveResult, saveResult);
    });
    return Promise.all(tasks).then(() => statusMap);
  }

  cube(
    cubeName: string,
    sorterFn: (matches: Cube[], clients: Client[]) => Cube
  ): Promise<Cube> {
    const clientList = this.clientList;
    return this.cubes().then(cubes => {
      const matches = cubes.filter(cube => cube.name === cubeName);
      if (!sorterFn && matches.length > 1) {
        throw new ClientError(`A cube named '${cubeName}' is present in more than one server. Define a sorter function to get the right cube.`);
      }
      return matches.length === 1 ? matches[0] : sorterFn(matches, clientList);
    });
  }

  cubes(): Promise<Cube[]> {
    const clients = this.clients;
    const promiseCubeList = Object.keys(clients).map(server => clients[server].cubes());
    return Promise.all(promiseCubeList).then(cubeList => [].concat(...cubeList));
  }

  execQuery(query: Query, format?: AllowedFormat, method?: string): Promise<Aggregation> {
    const cube: Cube = query.cube;
    const client = this.getClientByCube(cube);
    return client.execQuery(query, format, method);
  }

  getClientByCube(cube: Cube): Client {
    return this.clients[cube.server];
  }

  member(
    level: Level,
    key: string,
    getChildren?: boolean,
    caption?: string
  ): Promise<Member> {
    const client = this.getClientByCube(level.cube);
    return client.member(level, key, getChildren, caption);
  }

  members(level: Level, getChildren?: boolean, caption?: string): Promise<Member[]> {
    const client = this.getClientByCube(level.cube);
    return client.members(level, getChildren, caption);
  }
}

export default MultiClient;
