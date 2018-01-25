import formurlencoded = require('form-urlencoded');
import urljoin = require('url-join');
import * as isoFetch from 'isomorphic-fetch';

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
    'jsonstat': 'application/x-jsonstat'
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
    private cubesCache: { [cname: string]: Cube };

    constructor(api_base: string) {
        this.api_base = api_base;
        this.cubesCache = {};
    }

    cubes(): Promise<Cube[]> {
        return isoFetch(urljoin(this.api_base, 'cubes'))
            .then(rsp => rsp.json())
            .then((value) => {
                const cubes: Cube[] = [];
                value['cubes'].forEach((j) => {
                    const c = Cube.fromJSON(j);
                    cubes.push(c);
                    this.cubesCache[c.name] = c;
                });
                return cubes;
            });
    }

    cube(name: string): Promise<Cube> {
        if (this.cubesCache[name] !== undefined) {
            return Promise.resolve(this.cubesCache[name]);
        }
        else {
            return isoFetch(urljoin(this.api_base, 'cubes', name))
                .then(rsp => rsp.json())
                .then((value) => {
                    const c = Cube.fromJSON(value);
                    this.cubesCache[c.name] = c;
                    return c;
                });
        }
    }

    query(query: Query, format:string = "json", method:string = 'AUTO'): Promise<Aggregation> {
        let url = urljoin(this.api_base, query.path()),
        reqOptions = {
            method: 'get',
            headers: {
                'Accept': FORMATS[format]
            }
        };

        const qs = query.qs;

        if (method == 'AUTO') {
            method = url.length > MAX_GET_URI_LENGTH ? 'POST' : 'GET';
        }
        if (method == 'POST') {
            url = urljoin(this.api_base, `/cubes/${query.cube.name}/aggregate`);
            reqOptions.method = 'post';
            reqOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
            reqOptions['body'] = query.qs;
        }

        return isoFetch(url, reqOptions)
            .then(rsp => {
                if (rsp.ok) {
                    return rsp.json();
                }
                else {
                    return rsp.text()
                        .then(t => {
                            throw new MondrianClientError(rsp.status,
                                                          rsp.statusText,
                                                          t);
                        });
                }
            })
            .then((value) => new Aggregation(value, url, query.options));
    }

    members(level: Level, getChildren: boolean=false, caption:string=null): Promise<Member[]> {
        const cube = level.hierarchy.dimension.cube;
        const opts = {}
        if (getChildren) opts['children'] = true;

        if (caption !== null && !level.hasProperty(caption)) {
            throw new Error(`Property ${caption} does not exist in level ${level.fullName}`);
        }

        if (caption !== null) opts['caption'] = caption;

        let qs = formurlencoded(opts);
        if (qs.length > 1) qs = '?' + qs;

        return isoFetch(urljoin(this.api_base, 'cubes', cube.name, level.membersPath())+qs)
            .then(rsp => rsp.json())
            .then((value) => {
                return value['members'].map(Member.fromJSON);
            });
    }

    member(level: Level, key: string,getChildren: boolean=false, caption:string=null): Promise<Member> {
        const cube = level.hierarchy.dimension.cube;
           
        const opts = {}
        if (getChildren) opts['children'] = true;

        if (caption !== null && !level.hasProperty(caption)) {
            throw new Error(`Property ${caption} does not exist in level ${level.fullName}`);
        }

        if (caption !== null) opts['caption'] = caption;

        let qs = formurlencoded(opts);
        if (qs.length > 1) qs = '?' + qs;

        return isoFetch(urljoin(this.api_base, 'cubes', cube.name, level.membersPath(), key)+qs)
            .then(rsp => rsp.json())
            .then((value) => {
                return Member.fromJSON(value);
            });
    }
}
