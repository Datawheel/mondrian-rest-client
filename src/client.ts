import formurlencoded = require('form-urlencoded');
import urljoin = require('url-join');
import axios from 'axios';

import Cube from './cube';
import Query from './query';
import Aggregation from './aggregation';
import Member from './member';
import { Level } from './dimension';

const FORMATS = {
    'json': 'application/json',
    'csv': 'text/csv',
    'xls': 'application/vnd.ms-excel',
    'jsonrecords': 'application/x-jsonrecords',
    // 'jsonstat': 'application/x-jsonstat'
};

class MondrianClientError extends Error {
    public readonly status: number;
    public readonly body: any;
    public readonly error: any;

    constructor(status: number, statusText: string, body: any) {
        super();

        this.status = status;
        this.message = statusText;
        this.body = body;

        try {
            this.error = JSON.parse(this.body).error;
        }
        catch (e) {
            this.error = null;
        }

        // Set the prototype explicitly.
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MondrianClientError.prototype);
    }
}

const MAX_GET_URI_LENGTH = 2000;

export default class Client {

    private api_base: string;
    private cubesCache: Cube[] | Promise<Cube[]>;
    private cubeCache: { [cname: string]: Cube | Promise<Cube> };

    constructor(api_base: string) {
        this.api_base = api_base;
        this.cubesCache = undefined;
        this.cubeCache = {};
    }

    cubes(): Promise<Cube[]> {
        if (this.cubesCache !== undefined) {
            return Promise.resolve(this.cubesCache);
        }
        else {
            const p = axios.get(urljoin(this.api_base, 'cubes'))
                .then(rsp => {
                    return rsp.data['cubes'].map((j) => {
                        const c = Cube.fromJSON(j);
                        this.cubeCache[c.name] = c;
                        return c;
                    });
                });
            this.cubesCache = p;
            return p;
        }
    }

    cube(name: string): Promise<Cube> {
        if (this.cubeCache[name] !== undefined) {
            return Promise.resolve(this.cubeCache[name]);
        }
        else {
            const p = axios.get(urljoin(this.api_base, 'cubes', name))
                .then(rsp => Cube.fromJSON(rsp.data));
            this.cubeCache[name] = p;
            return p;
        }
    }

    query(query: Query, format: string = "json", method: string = 'AUTO'): Promise<Aggregation> {
        let url = urljoin(this.api_base, query.path()),
            reqOptions = {
                url,
                method: 'get',
                headers: {
                    'Accept': FORMATS[format]
                }
            };

        if (method == 'AUTO') {
            method = url.length > MAX_GET_URI_LENGTH ? 'POST' : 'GET';
        }
        if (method == 'POST') {
            reqOptions.url = urljoin(this.api_base, `/cubes/${query.cube.name}/aggregate`);
            reqOptions.method = 'post';
            reqOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
            reqOptions['data'] = query.qs;
        }

        return axios(reqOptions)
            .then(rsp => {
                if (rsp.status > 199 && rsp.status < 300) {
                    return new Aggregation(rsp.data, url, query.options);
                }
                else {
                    throw new MondrianClientError(rsp.status, rsp.statusText, rsp.data);
                }
            });
    }

    members(level: Level, getChildren: boolean = false, caption: string = null): Promise<Member[]> {
        const cube = level.hierarchy.dimension.cube;
        const opts = {}
        if (getChildren) opts['children'] = true;

        if (caption !== null && !level.hasProperty(caption)) {
            throw new Error(`Property ${caption} does not exist in level ${level.fullName}`);
        }

        if (caption !== null) opts['caption'] = caption;

        return axios({
            url: urljoin(this.api_base, 'cubes', cube.name, level.membersPath()),
            params: opts
        }).then(rsp => rsp.data['members'].map(Member.fromJSON));
    }

    member(level: Level, key: string, getChildren: boolean = false, caption: string = null): Promise<Member> {
        const cube = level.hierarchy.dimension.cube;

        const opts = {}
        if (getChildren) opts['children'] = true;

        if (caption !== null && !level.hasProperty(caption)) {
            throw new Error(`Property ${caption} does not exist in level ${level.fullName}`);
        }

        if (caption !== null) opts['caption'] = caption;

        let qs = formurlencoded(opts);
        if (qs.length > 1) qs = '?' + qs;

        return axios.get(urljoin(this.api_base, 'cubes', cube.name, level.membersPath(), key) + qs)
            .then(rsp => Member.fromJSON(rsp.data));
    }
}
