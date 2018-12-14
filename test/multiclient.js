const path = require('path');
const assert = require('assert');

const mrc = require(path.join(__dirname, '..', 'lib', 'mondrian-rest'));
const MultiClient = mrc.MultiClient;

describe('MultiClient', function() {
    this.timeout(10000);

    const serverA = 'https://mammoth-api.datausa.io';
    const serverB = 'https://chilecube.staging.datachile.io';
    let client;
    beforeEach(function() {
      client = new MultiClient([serverA, serverB]);
    });

    it("can retrieve a cube by name", function() {
        return client.cube("dot_faf").then(cube => {
            assert.equal(cube.name, "dot_faf");
        });
    });

    // it("can retrieve a cube by name and sorter function", function() {
    //     const sorter = matches => {
    //         matches.
    //     }
    //     return client.cube("dot_faf").then(cube => {
    //         assert.equal(cube.name, "dot_faf");
    //     });
    // });

    it("can query correctly from two servers with the same client", function() {
        const queries = [];

        // Get a query from serverA
        queries[0] = client.cube("dot_faf").then(function(cube) {
            const query = cube.query;
            query.drilldown("Origin", "Origin State");
            query.measure("Millions Of Dollars");
            query.cut("[Destination].[Destination State].&[04000US12]");
            return client.query(query);
        });

        // Get a query from serverB
        queries[1] = client.cube("election_participation").then(function(cube) {
            const query = cube.query;
            query.drilldown("Geography", "Region");
            query.measure("Electors");
            query.cut("[Election Type].[Election Type].&[3]");
            return client.query(query);
        });

        return Promise.all(queries).then(function(result) {
            assert.deepStrictEqual({
                total: result.length,
                urlA: result[0].url,
                dataA: Array.isArray(result[0].data.values),
                urlB: result[1].url,
                dataB: Array.isArray(result[1].data.values),
            }, {
                total: 2,
                urlA: serverA + '/cubes/dot_faf/aggregate?drilldown%5B%5D=%5BOrigin%5D.%5BOrigin+State%5D&cut%5B%5D=%5BDestination%5D.%5BDestination+State%5D.%26%5B04000US12%5D&measures%5B%5D=Millions+Of+Dollars&nonempty=true&distinct=false&parents=false&debug=false&sparse=true',
                dataA: true,
                urlB: serverB + '/cubes/election_participation/aggregate?drilldown%5B%5D=%5BGeography%5D.%5BRegion%5D&cut%5B%5D=%5BElection+Type%5D.%5BElection+Type%5D.%26%5B3%5D&measures%5B%5D=Electors&nonempty=true&distinct=false&parents=false&debug=false&sparse=true',
                dataB: true
            });
        });
    });

    // it("returns the members of a level and replaces their caption with the requested property", function() {});
});
