import {Client, Cube, Level} from "mondrian-rest-client";

let globalClient, globalCube;
const randomChoice = list => list[Math.floor(Math.random() * list.length)];

beforeAll(async () => {
  globalClient = new Client(SERVER_URL);
  const cubes = await globalClient.cubes();
  globalCube = randomChoice(cubes);
});

test("can test if an object is a cube", () => {
  expect(Cube.isCube(globalClient)).toBeFalsy();
  expect(Cube.isCube(globalCube)).toBeTruthy();
});

test("can get a level", () => {
  const testLevel = globalCube.findLevel(null, true);
  const level = globalCube.getLevel(testLevel.fullname);
  expect(Level.isLevel(level)).toBeTruthy();
});

test("can find the expected items by fullname", () => {
  const measure = randomChoice(globalCube.measures);
  const foundMeasure = globalCube.queryFullname(measure.fullname);
  expect(foundMeasure).toBe(measure);
  const foundMeasureByName = globalCube.queryFullname(measure.name);
  expect(foundMeasureByName).toBe(measure);

  const dimension = randomChoice(globalCube.dimensions);
  const foundDimension = globalCube.queryFullname(dimension.fullname);
  expect(foundDimension).toBe(dimension);
  const foundDimensionByName = globalCube.queryFullname(dimension.name);
  expect(foundDimensionByName).toBe(dimension);

  // Edge case: Hie.name == Lvl.name
  // `Dim.Hie.Lvl` will be abbreviated as `Dim.Lvl`, and will be equal to `Dim.Hie`
  // Cube.queryFullname() will return the Level instead of the Hierarchy
  const hierarchy = randomChoice(dimension.hierarchies);
  // if (dimension.name !== hierarchy.name) {
  //   const foundHierarchy = globalCube.queryFullname(hierarchy.fullname);
  //   expect(foundHierarchy).toBe(hierarchy);
  // }

  const level = randomChoice(hierarchy.levels);
  const foundLevel = globalCube.queryFullname(level.fullname);
  expect(foundLevel).toBe(level);
});
