let path = require('path');
let assert = require('assert');

let mrc = require(path.join(__dirname, '..', 'lib', 'mondrian-rest'));
let MultiClient = mrc.MultiClient;

describe('Client', function() {
    const serverA = 'https://canon-api.datausa.io/';
    const serverB = 'https://chilecube.staging.datachile.io';
    let client;
    beforeEach(function() {
      client = new MultiClient([serverA, serverB]);
    });

    it("queries correctly from two servers with the same client", function() {
        const queries = [];
        
        // Get a query from DataUSA/serverA
        queries[0] = client.cube("dot_faf").then(function(cube) {
            const query = cube.query;
            query.drilldown("Origin", "Origin State");
            query.measure("Millions Of Dollars");
            query.cut("[Destination].[Destination State].&[04000US12]");
            return client.query(query);
        });
        
        // Get a query from DataChile/serverB
        queries[0] = client.cube("election_participation").then(function(cube) {
            const query = cube.query;
            query.drilldown("Geography", "Region");
            query.measure("Electors");
            query.cut("[Election Type].[Election Type].&[3]");
            return client.query(query);
        });

        return Promise.all(queries);
    });

    // it("returns the members of a level and replaces their caption with the requested property", function() {});
});