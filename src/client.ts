import formurlencoded = require('form-urlencoded');
import urljoin = require('url-join');
import axios from 'axios';
import { unique } from 'shorthash';

import Aggregation from './aggregation';
import Cube from './cube';
import { Level } from './dimension';
import { MondrianRestError } from './errors';
import Member from './member';
import Query from './query';

const FORMATS = {
    json: 'application/json',
    csv: 'text/csv',
    xls: 'application/vnd.ms-excel',
    jsonrecords: 'application/x-jsonrecords'
};

const MAX_GET_URI_LENGTH = 2000;

export default class Client {
    private api_base: string;
    private cubesCache: Promise<Cube[]>;
    private legacy: boolean = false;

    key: string;

    constructor(api_base: string) {
        this.api_base = api_base;
        this.cubesCache = undefined;
        this.key = unique(api_base);
    }

    private setLegacyServer(): void {
        this.legacy = true;
    }

    cubes(): Promise<Cube[]> {
        if (this.cubesCache !== undefined) {
            return Promise.resolve(this.cubesCache);
        }
        else {
            const server = this.api_base;
            const cubeBuilder = Cube.fromJSON.bind(Cube, this.key);
            const p = axios.get(urljoin(server, 'cubes')).then(rsp => {
                return rsp.data['cubes'].map(cubeBuilder);
            });
            this.cubesCache = p;
            return p;
        }
    }

    cube(name: string): Promise<Cube> {
        if (this.cubesCache) {
            return Promise.resolve(this.cubesCache).then(cubes =>
                cubes.find(cb => cb.name === name)
            );
        }
        const key = this.key;
        return axios.get(urljoin(this.api_base, 'cubes', name)).then(rsp =>
            Cube.fromJSON(key, rsp.data)
        );
    }

    query(query: Query, format: string = 'json', method: string = 'AUTO'): Promise<Aggregation> {
        const queryPath = query.path(format);
        let url = urljoin(this.api_base, queryPath),
            reqOptions = {
                url,
                method: 'GET',
                headers: {
                    'Accept': FORMATS[format]
                }
            };

        if (method == 'AUTO') {
            method = url.length > MAX_GET_URI_LENGTH ? 'POST' : 'GET';
        }
        if (method == 'POST') {
            reqOptions.url = url.split('?', 1).shift();
            reqOptions.method = 'POST';
            reqOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
            reqOptions['data'] = query.qs;
        }

        return axios(reqOptions).then(rsp => {
            if (rsp.status > 199 && rsp.status < 300) {
                return new Aggregation(rsp.data, url, query.options);
            }
            throw new MondrianRestError(rsp);
        });
    }

    members(level: Level, getChildren: boolean = false, caption: string = null): Promise<Member[]> {
        const cube = level.hierarchy.dimension.cube;
        const opts = {};
        if (getChildren) opts['children'] = true;

        if (caption !== null && !level.hasProperty(caption)) {
            throw new Error(`Property ${caption} does not exist in level ${level.fullName}`);
        }

        if (caption !== null) opts['caption'] = caption;

        return axios({
            url: urljoin(this.api_base, 'cubes', cube.name, level.membersPath(this.legacy)),
            params: opts
        }).then(
            rsp => rsp.data['members'].map(Member.fromJSON),
            err => {
                if (err.response.status === 404) {
                    this.setLegacyServer();
                    return this.members(level, getChildren, caption);
                }
                throw err;
            }
        );
    }

    member(level: Level, key: string, getChildren: boolean = false, caption: string = null): Promise<Member> {
        const cube = level.hierarchy.dimension.cube;
        const opts = {};

        if (getChildren) opts['children'] = true;

        if (caption !== null && !level.hasProperty(caption)) {
            throw new Error(`Property ${caption} does not exist in level ${level.fullName}`);
        }

        if (caption !== null) opts['caption'] = caption;

        let qs = formurlencoded(opts);
        if (qs.length > 1) qs = '?' + qs;

        return axios
            .get(urljoin(this.api_base, 'cubes', cube.name, level.membersPath(true), key) + qs)
            .then(rsp => Member.fromJSON(rsp.data));
    }
}
