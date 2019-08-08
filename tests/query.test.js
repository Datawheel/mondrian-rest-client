import {Client, stringifyCut} from "mondrian-rest-client";

let globalClient, globalCube;

beforeAll(() => {
  globalClient = new Client(SERVER_URL);
  return globalClient.cube(CUBE_NAME).then(cube => {
    globalCube = cube;
  });
});

test("can generate a valid query object", () => {
  const query = globalCube.query;
  expect(query).toBeDefined();
  expect(query.cube).toBe(globalCube);
});

describe("while handling drilldowns", () => {
  let query, level;

  beforeEach(() => {
    query = globalCube.query;
    level = globalCube.findLevel(null, true);
  });

  test("can add a drilldown from a Level object", () => {
    query.addDrilldown(level);
    expect(query.drilldowns.length).toBe(1);
  });

  test("can add a drilldown from a fullname string", () => {
    query.addDrilldown(level.fullname);
    expect(query.drilldowns.length).toBe(1);
  });

  test("can prevent adding a drilldown twice", () => {
    query.addDrilldown(level);
    query.addDrilldown(level.fullname);
    expect(query.drilldowns.length).toBe(1);
  });
});

describe("while handling measures", () => {
  let query, measure;

  beforeEach(() => {
    measure = globalCube.measures[0];
    query = globalCube.query;
  });

  test("can add a measure from a Measure object", () => {
    query.addMeasure(measure);
    expect(query.measures.length).toBe(1);
  });

  test("can add a measure from a name string", () => {
    query.addMeasure(measure.name);
    expect(query.measures.length).toBe(1);
  });
});

describe("while handling cuts", () => {
  let query, level, members;

  beforeAll(async () => {
    level = globalCube.findLevel(null, true);
    members = await globalClient.members(level);
  });

  beforeEach(() => {
    query = globalCube.query;
  });

  test("can add a cut from a Level + Member[] combo", () => {
    expect(level).toBeTruthy();

    const memberList = members.slice(0, 2);
    expect(memberList.length).toBeGreaterThanOrEqual(1);

    query.addCut(level, memberList);
    expect(level.fullname in query.cuts).toBeTruthy();
    expect(Array.isArray(query.cuts[level.fullname])).toBeTruthy();
  });

  test("can add a cut from a Level.fullname + Member.key[] combo", () => {
    const levelFullName = level.fullname;
    expect(levelFullName).toBeTruthy();

    const memberList = members.slice(0, 2).map(m => m.key);
    expect(memberList.length).toBeGreaterThanOrEqual(1);

    query.addCut(levelFullName, memberList);
    expect(levelFullName in query.cuts).toBeTruthy();
    expect(Array.isArray(query.cuts[levelFullName])).toBeTruthy();
  });

  test("can add a cut from a preformed cut string", () => {
    const levelFullName = level.fullname;
    expect(levelFullName).toBeTruthy();

    const memberList = members.slice(0, 2).map(m => m.key);
    expect(memberList.length).toBeGreaterThanOrEqual(1);

    const cut = stringifyCut(levelFullName, memberList);
    query.addCut(cut);
    expect(Object.keys(query.cuts).length).toBe(1);
  });

  test("can recognize an invalid cut string", () => {
    // invalid cut structure, can't get a drillable
    expect(query.addCut.bind(query, "Completely invalid")).toThrow();
    // invalid drillable fullname
    expect(query.addCut.bind(query, "FakeDimension.1,2")).toThrow();
    // non-existent drillable
    expect(query.addCut.bind(query, "Valid.Fullname.1,2")).toThrow();
    // non-existent drillable, members through second parameter
    expect(query.addCut.bind(query, "Valid.Fullname.Structure", [1, 2])).toThrow();
    // valid dimension fullname, but is not a drillable
    expect(query.addCut.bind(query, level.dimension.fullname, [1, 2])).toThrow();
    // members parameter must be an array
    expect(query.addCut.bind(query, level.fullname, "1,2")).toThrow(TypeError);
    // members parameter can be empty but nothing will be saved
    query.addCut(level, []);
    // nothing should have passed
    expect(Object.keys(query.cuts).length).toBe(1);
  })
});
