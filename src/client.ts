import axios, { Promise, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import urljoin = require('url-join');

import Cube from './cube';
import Query from './query';
import Aggregation from './aggregation';

export default class Client {

    private api_base: string;

    constructor(api_base: string) {
        this.api_base = api_base;
    }

    cube(name: string): Promise<Cube> {
        return axios.get(urljoin(this.api_base, 'cubes', name))
            .then((value: AxiosResponse) => {
                return Cube.fromJSON(value.data)
            });
    }

    query(query: Query) {
        return axios
            .get(urljoin(this.api_base, query.path()))
            .then((value) => {
                return new Aggregation(value.data.data);
            });
    }
}
