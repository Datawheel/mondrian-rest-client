let path = require('path');
let assert = require('assert');
let querystring = require('querystring');

let response = require('./fixtures/cube_response.json');

let mrc = require(path.join(__dirname, '..', 'lib', 'mondrian-rest'));
let Query  = mrc.Query;
let Cube = mrc.Cube;

describe('Query', function() {
    let cube, query;
    beforeEach(function() {
        cube = Cube.fromJSON(response);
        query = cube.query;
    });

    it('accepts one valid measure', function() {
        // accepts one
        q = query.measure('FOB US');
        assert.equal(querystring.parse(q.qs)['measures[]'], 'FOB US');
    });

    it('accepts multiple valid measures', function() {
        // accepts two
        q = query.measure('FOB US').measure('RCA');
        assert.deepEqual(querystring.parse(q.qs)['measures[]'], ['FOB US', 'RCA']);
    });

    it('rejects an invalid measure', function() {
        assert.throws(function() {
            query.measure('No existe');
        },
                      Error);
    });

    it('accepts one valid drilldown and measures', function() {
        q = query
            .drilldown('Geography', 'Region')
            .measure('FOB US')
            .measure('RCA');

        assert.equal(querystring.parse(q.qs)['drilldown[]'], '[Geography].[Region]');

        console.log(q.path('jsonrecords'));
    });

    it('rejects and invalid drilldown', function() {
        assert.throws(function() {
            query
                .drilldown('Geography', 'Block')
        },
                      Error);
    });
});

describe('Query with properties', function() {
    let response, cube, query;
    beforeEach(function() {
        response = require('./fixtures/tax_data.json');
        cube = Cube.fromJSON(response);
        query = cube.query;
    });

    it('accepts a valid property', function() {
        q = query.property('ISICrev4', 'Level 1', 'Level 1 ES');
        assert.equal(querystring.parse(q.qs)['properties[]'], '[ISICrev4].[Level 1].Level 1 ES');
    });

    it('rejects an invalid property', function() {
        assert.throws(function() {
            query.property('ISICrev4', 'Level 1', 'No existe');
        },
                      Error);
    })
});

describe('Query with caption', function() {
    let response, cube, query;
    beforeEach(function() {
        response = require('./fixtures/tax_data.json');
        cube = Cube.fromJSON(response);
        query = cube.query;
    });

    it('accepts a valid caption', function() {
        q = query.caption('ISICrev4', 'Level 1', 'Level 1 ES');
        assert.equal(querystring.parse(q.qs)['caption[]'], '[ISICrev4].[Level 1].Level 1 ES');
    });
});
