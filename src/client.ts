import axios, { Promise, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import urljoin = require('url-join');

import Cube from './cube';
import Query from './query';
import Aggregation from './aggregation';

export default class Client {

    private api_base: string;
    private cubesCache: { [cname: string]: Cube };

    constructor(api_base: string) {
        this.api_base = api_base;
        this.cubesCache = {};
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
}
