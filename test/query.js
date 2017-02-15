let path = require('path');
let assert = require('assert');
let querystring = require('querystring');

let response = require('./fixtures/cube_response.json');

let mrc = require(path.join(__dirname, '..', 'mondrian-rest'));
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

    it('accepts one valid drilldown', function() {
        q = query
            .drilldown('Geography', 'Region')
            .measure('FOB US')
            .measure('RCA');

        assert.equal(querystring.parse(q.qs)['drilldown[]'], '[Geography].[Region]');
    });

    it('rejects and invalid drilldown', function() {
        assert.throws(function() {
            query
                .drilldown('Geography', 'Block')
        },
                      Error);
    });
});
