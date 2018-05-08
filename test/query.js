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
    });

    it('rejects and invalid drilldown', function() {
        assert.throws(function() {
            query
                .drilldown('Geography', 'Block');
        },
                      Error);
    });

    it('accepts a valid option', function() {
      qs = query.drilldown('Geography', 'Region').option('parents', true).option('sparse', false).qs;
      assert.equal(querystring.parse(qs)['parents'], 'true');
      assert.equal(querystring.parse(qs)['sparse'], 'false');
    });

    it('rejects an invalid option', function() {
        assert.throws(function() {
         query.drilldown('Geography', 'Region').option('invalid', true);
        }, Error);
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
    });
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

describe('Query with drilldown on namedset', function() {
  let response, cube, query;

  beforeEach(function() {
    response = require('./fixtures/another_cube_with_named_set.json');
    cube = Cube.fromJSON(response);
    query = cube.query;
  });

  it('drilldowns on a level and a namedset', function() {
    q = query
      .drilldown('Year', 'Year')
      .drilldown('CNY Filter County')
      .measure('t_dollars')
      .measure('Dollars Sum')
      .measure('Latest Dollars Sum');
    assert.deepEqual(querystring.parse(q.qs)['drilldown[]'], [ '[Year].[Year]', 'CNY Filter County' ]);
  });
});

describe("Query with filter measures", function() {
  let response, cube, query;
  beforeEach(function() {
    response = require('./fixtures/tax_data.json');
    cube = Cube.fromJSON(response);
    query = cube.query;
  });

  it('should accept a single-clause valid filter expression', function() {
    q = query
      .filter('Labour Cost', '>', 24700);
    assert.deepEqual(querystring.parse(q.qs)['filter[]'], 'Labour Cost > 24700');
  });

  it('should accept a multiple-clause valid filter expression', function() {
    q = query
      .filter('Labour Cost', '>=', 24700)
      .filter('Value Added', '<', 5555);
    assert.deepEqual(querystring.parse(q.qs)['filter[]'], ['Labour Cost >= 24700', 'Value Added < 5555']);
  });

  it('should error on non-existent measure name', function() {
    assert.throws(function() {
      query.filter('Invalid measure', '<', 5555);
    }, Error);
  });
});

describe("Query with sorting parameters", function() {
  let response, cube, query;
  beforeEach(function() {
    response = require('./fixtures/tax_data.json');
    cube = Cube.fromJSON(response);
    query = cube.query;
  });

  it('should accept a sorting by measure without order direction', function() {
    q = query
      .sorting('Labour Cost');
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['order'], 'Measures.[Labour Cost]');
    assert.deepEqual(qs['order_desc'], undefined);
  });

  it('should accept a sorting by measure with desc order direction', function() {
    q = query
      .sorting('Labour Cost', true);
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['order'], 'Measures.[Labour Cost]');
    assert.deepEqual(qs['order_desc'], 'true');
  });

  it('should accept a sorting by property without order direction', function() {
    q = query
      .sorting(["ISICrev4", "Level 1", "Level 1 ES"]);
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['order'], '[ISICrev4].[Level 1].Level 1 ES');
    assert.deepEqual(qs['order_desc'], undefined);
  });

  it('should accept a sorting by property with asc order direction', function() {
    q = query
      .sorting(["ISICrev4", "Level 2", "Level 2 ES"], false);
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['order'], '[ISICrev4].[Level 2].Level 2 ES');
    assert.deepEqual(qs['order_desc'], 'false');
  });

  it('should accept a sorting by intrinsic property without order direction', function() {
    q = query
      .sorting(["ISICrev4", "Level 1", "Caption"]);
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['order'], '[ISICrev4].[Level 1].Caption');
    assert.deepEqual(qs['order_desc'], undefined);
  });

  it('should reject a sorting by an invalid measure', function() {
    assert.throws(function() {
      query.sorting("Level 1 ES", false);
    }, Error);
  });

  it('should reject a sorting by an invalid property', function() {
    assert.throws(function() {
      query.sorting(["Labour Cost"], true);
    }, Error);
  });
});

describe("Query with pagination parameters", function() {
  let response, cube, query;
  beforeEach(function() {
    response = require('./fixtures/tax_data.json');
    cube = Cube.fromJSON(response);
    query = cube.query;
  });

  it('should accept a limit without offset', function() {
    q = query
      .pagination(1);
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['limit'], '1');
    assert.deepEqual(qs['offset'], undefined);
  });

  it('should accept a limit with offset', function() {
    q = query
      .pagination(1, 2);
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['limit'], '1');
    assert.deepEqual(qs['offset'], '2');
  });

  it('should reset limit and offset if called with no parameters', function() {
    q = query
      .pagination(1, 2)
      .pagination();
    qs = querystring.parse(q.qs);
    assert.deepEqual(qs['limit'], undefined);
    assert.deepEqual(qs['offset'], undefined);
  });
});
