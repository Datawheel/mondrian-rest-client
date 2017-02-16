let path = require('path');
let assert = require('assert');

let mrc = require(path.join(__dirname, '..', 'mondrian-rest'));

let Cube = mrc.Cube;

describe('Cube', function() {
    let response, cube;
    beforeEach(function() {
        response = require('./fixtures/cube_response.json');
        cube = Cube.fromJSON(response);
    });


    it('returns standard dimensions', function() {
        assert.deepEqual(cube.standardDimensions.map(function(d) { return d.name; }),
                     ['Destination Country', 'Geography', 'Export HS']);
    });

    it('returns time dimension', function() {
        assert.equal(cube.timeDimension.name,
                     'Date');
    });
});

describe('Cube with properties', function() {
    let response, cube;
    beforeEach(function() {
        response = require('./fixtures/tax_data.json');
        cube = Cube.fromJSON(response);
    });

    it('parses Level properties', function() {
        cube.dimensionsByName['ISICrev4']
            .hierarchies[0].levels.slice(1)
            .forEach(function(l) {
                assert.equal(l.properties.length, 1);
            });
    });

});
