let path = require('path');
let assert = require('assert');

let mrc = require(path.join(__dirname, '..', 'lib', 'mondrian-rest'));

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

describe('Cube with named set', function() {
    let response, cube;

    beforeEach(function() {
        response = require('./fixtures/cube_with_named_set.json');
        cube = Cube.fromJSON(response);
    });

    it('parses named_sets', function() {
        var ns = cube.namedSets[0];
        assert.equal(cube
                       .dimensionsByName['Nationality']
                       .getHierarchy('Nationality')
                       .getLevel('Country of Origin'),
                     ns.level);
    });
});



describe('Level', function() {
    let response, cube;
    beforeEach(function() {
        response = require('./fixtures/tax_data.json');
        cube = Cube.fromJSON(response);
    });

    it('generates a path for getting a Level\'s members', function() {
        assert.equal(cube.dimensions[1].hierarchies[0].levels[1].membersPath(),
                     '/dimensions/Tax Geography/levels/Region/members');
    });
});
