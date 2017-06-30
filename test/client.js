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
                                               'namedSets',
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

    it('sends a POST instead of GET when URI is too large', function() {
        const cuts = ["0101", "0102", "0103", "0104", "0105", "0106", "0201", "0202", "0203", "0204", "0205", "0206", "0207", "0208", "0209", "0210", "0301", "0302", "0303", "0304", "0305", "0306", "0307", "0401", "0402", "0403", "0404", "0405", "0406", "0407", "0408", "0409", "0410", "0501", "0502", "0503", "0504", "0505", "0506", "0507", "0508", "0509", "0510", "0511", "0601", "0602", "0603", "0604", "0701", "0702", "0703", "0704", "0705", "0706", "0707", "0708", "0709", "0710", "0711", "0712", "0713", "0714", "0801", "0802", "0803", "0804", "0805", "0806", "0807", "0808", "0809", "0810", "0811", "0812", "0813", "0814", "0901", "0902", "0903", "0904", "0905", "0906", "0907", "0908", "0909", "0910"];
        let c = client.cube('imports');
        return c.then(function(cube) {
            let q = cube.query
                .drilldown('Date', 'Year')
                .measure('CIF US');

            q = cuts.reduce(function(query, id) {
                return query.cut('[Import HS].[HS4].&[' + id + ']');
            }, q);

            return client.query(q);
        }).then(function(q) {
            // TODO add assertions
        });
    });

    it('sends a POST request if forced', function() {
        let c = client.cube('imports');
        return c.then(function(cube) {
            let q = cube.query
                .drilldown('Date', 'Year')
                .measure('CIF US');

            return client.query(q, 'json', 'POST');
        }).then(function(q) {
            // TODO add assertions
        });
    });

});
