let path = require('path');
let assert = require('assert');

XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

let mrc = require(path.join(__dirname, '..', 'lib', 'mondrian-rest'));
let Client = mrc.Client;

describe('Cube', function() {
    let client;
    beforeEach(function() {
        //client = new Client('http://chilecube.datawheel.us');
        client = new Client('http://hermes:5000');
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
});
