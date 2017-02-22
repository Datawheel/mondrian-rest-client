import axios, { Promise, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import urljoin = require('url-join');

import Cube from './cube';
import Query from './query';
import Aggregation from './aggregation';
import Member from './member';
import { Level } from './dimension';

export default class Client {

    private api_base: string;
    private cubesCache: { [cname: string]: Cube };

    constructor(api_base: string) {
        this.api_base = api_base;
        this.cubesCache = {};
    }

    cubes(): Promise<Cube[]> {
        return axios.get(urljoin(this.api_base, 'cubes'))
            .then((value: AxiosResponse) => {
                const cubes: Cube[] = [];
                value.data.cubes.forEach((j) => {
                    const c = Cube.fromJSON(j);
                    cubes.push(c);
                    this.cubesCache[c.name] = c;
                });
                return cubes;
            })
    }

    cube(name: string): Promise<Cube> {
        if (name in this.cubesCache) {
            return Promise.resolve(this.cubesCache[name]);
        }
        else {
            return axios.get(urljoin(this.api_base, 'cubes', name))
                .then((value: AxiosResponse) => {
                    const c = Cube.fromJSON(value.data);
                    this.cubesCache[c.name] = c;
                    return c;
                });
        }
    }

    query(query: Query): Promise<Aggregation> {
        return axios
            .get(urljoin(this.api_base, query.path()))
            .then((value) => {
                return new Aggregation(value.data.data);
            });
    }

    members(level: Level): Promise<Member[]> {
        const cube = level.hierarchy.dimension.cube;
        console.log(urljoin(this.api_base, 'cubes', cube.name, level.membersPath()));
        return axios
            .get(urljoin(this.api_base, 'cubes', cube.name, level.membersPath()))
            .then((value: AxiosResponse) => {
                return value.data.members.map(Member.fromJSON);
            });
    }
}
