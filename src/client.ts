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
    'jsonrecords': 'application/x-jsonrecords'
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
            })
    }

    cube(name: string): Promise<Cube> {
        if (name in this.cubesCache) {
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

    query(query: Query, format:string = "json"): Promise<Aggregation> {
        const url = urljoin(this.api_base, query.path());
        return isoFetch(url,
                        {
                            headers: {
                                'Accept': FORMATS[format]
                            }})
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

    members(level: Level): Promise<Member[]> {
        const cube = level.hierarchy.dimension.cube;
        return isoFetch(urljoin(this.api_base, 'cubes', cube.name, level.membersPath()))
            .then(rsp => rsp.json())
            .then((value) => {
                return value['members'].map(Member.fromJSON);
            });
    }
}
