import {
  AggregatorType,
  Client,
  Comparison,
  Cube,
  Dimension,
  Format,
  Hierarchy,
  joinFullname,
  Level,
  Measure,
  Member,
  MultiClient,
  NamedSet,
  Order,
  Query,
  splitFullname
} from "mondrian-rest-client";

test("can import enum AggregatorType", () => {
  expect(typeof AggregatorType).toBe("object");
  expect(AggregatorType.AVG).toBe("AVG");
  expect(AggregatorType.COUNT).toBe("COUNT");
  expect(AggregatorType.MAX).toBe("MAX");
  expect(AggregatorType.MIN).toBe("MIN");
  expect(AggregatorType.SUM).toBe("SUM");
  expect(AggregatorType.UNKNOWN).toBe("UNKNOWN");
});

test("can import class Client", () => {
  expect(Client.name).toBe("Client");
});

test("can import enum Comparison", () => {
  expect(typeof Comparison).toBe("object");
  expect(Comparison.eq).toBe("=");
  expect(Comparison.gt).toBe(">");
  expect(Comparison.gte).toBe(">=");
  expect(Comparison.lt).toBe("<");
  expect(Comparison.lte).toBe("<=");
});

test("can import class Cube", () => {
  expect(Cube.name).toBe("Cube");
});

test("can import class Dimension", () => {
  expect(Dimension.name).toBe("Dimension");
});

test("can import enum Format", () => {
  expect(typeof Format).toBe("object");
  expect(Format.csv).toBe("csv");
  expect(Format.jsonrecords).toBe("jsonrecords");
});

test("can import class Hierarchy", () => {
  expect(Hierarchy.name).toBe("Hierarchy");
});

test("can import function joinFullname", () => {
  expect(typeof joinFullname).toBe("function");
});

test("can import class Level", () => {
  expect(Level.name).toBe("Level");
});

test("can import class Measure", () => {
  expect(Measure.name).toBe("Measure");
});

test("can import class Member", () => {
  expect(Member.name).toBe("Member");
});

test("can import class MultiClient", () => {
  expect(MultiClient.name).toBe("MultiClient");
});

test("can import class NamedSet", () => {
  expect(NamedSet.name).toBe("NamedSet");
});

test("can import enum Order", () => {
  expect(typeof Order).toBe("object");
  expect(Order.asc).toBe("asc");
  expect(Order.desc).toBe("desc");
});

test("can import class Query", () => {
  expect(Query.name).toBe("Query");
});

test("can import function splitFullname", () => {
  expect(typeof splitFullname).toBe("function");
});
