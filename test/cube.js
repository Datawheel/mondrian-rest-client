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
        console.log(cube);
        assert.equal(cube.timeDimension.name,
                     'Date');
    });
});
