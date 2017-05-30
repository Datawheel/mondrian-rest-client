let path = require('path');
let assert = require('assert');

let mrc = require(path.join(__dirname, '..', 'lib', 'mondrian-rest'));
let Client = mrc.Client;

describe('Cube', function() {
    let client;
    beforeEach(function() {
        client = new Client('http://chilecube.datawheel.us');
        //client = new Client('http://hermes:5000');
    });

    it('get a cube from server', function() {
        let c = client.cube('imports');
        return c.then(function(c) {
            assert.deepEqual(Object.keys(c), [ 'annotations',
                                               'name',
                                               'caption',
                                               'measures',
                                               'dimensions',
                                               'dimensionsByName' ]);
        });
    });

    it('gets a cube from the server and performs a query', function() {
        let c = client.cube('tax_data');
        return c.then(function(cube) {
            return client.query(cube.query
                                .drilldown('ISICrev4', 'Level 1')
                                .drilldown('Date', 'Year')
                                .measure('Output'));
        })
            .then(function(q) {
                // TODO add assertions
            });
    });

    it('returns the cubes defined in the server', function() {
        return client.cubes().then(function(cubes) {
            // TODO add assertions
            console.log(cubes);
        });
    });

    it('returns the members of a level', function() {
        return client.cube('tax_data')
            .then(function(cube) {
                return client.members(cube.dimensionsByName['Tax Geography'].hierarchies[0].levels[2]);
            })
            .then(function(members) {
                // TODO add assertions
                console.log(members);
            });
    });

    it('correctly behaves on a 400 error', function() {
        let c = client.cube('income_gini');
        return c.then(function(cube) {
            return client.query(
                cube.query.drilldown('Date', 'Year')
            );
        })
            .then(function(aggregation) {
                console.log('aggregation', aggregation);
            });
    });


});
