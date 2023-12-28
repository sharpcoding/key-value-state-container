import { getChangedPaths } from "../get-changed-paths";

test("changed paths are detected for spread-modified object in the deep comparison", async () => {
  const baseCar = {
    engine: {
      horsepower: 100,
      cylinders: 4,
    },
    body: {
      type: "sedan",
      color: "black",
    },
  };

  const tunedCar = structuredClone({
    ...baseCar,
    engine: { ...baseCar.engine, horsepower: 200 },
  });

  expect(
    getChangedPaths({
      comparison: "deep",
      newState: tunedCar,
      oldState: baseCar,
    })
  ).toEqual(["engine"]);
});

test("changed paths are detected for inline-modified object in the deep comparison", async () => {
  const baseCar = {
    engine: {
      horsepower: 100,
      cylinders: 4,
    },
    body: {
      type: "sedan",
      color: "black",
    },
  };

  const tunedCar = structuredClone(baseCar);
  tunedCar.engine.horsepower = 200;

  expect(
    getChangedPaths({
      comparison: "deep",
      newState: tunedCar,
      oldState: baseCar,
    })
  ).toEqual(["engine"]);
});

test("changed paths works with functions", async () => {
  const baseCar = {
    engine: {
      horsepower: 100,
      cylinders: 4,
    },
    body: {
      type: "sedan",
      color: "black",
    },
    start: () => {
      console.log("starting base car with 100 horsepower");
    },
  };

  const tunedCar = {
    ...baseCar,
    start: () => {
      console.log("starting 200 horsepower tuned car");
    },
    stop: () => {
      console.log("stopping tuned car");
    }
  };

  expect(
    getChangedPaths({
      comparison: "shallow",
      newState: tunedCar,
      oldState: baseCar,
    })
  ).toEqual(["start", "stop"]);
});

test("changed paths does not detect mutated objects", async () => {
  const baseCar = {
    engine: {
      horsepower: 140,
      cylinders: 4,
    },
    body: {
      type: "sedan",
      color: "black",
    },
    price: 10000,
  };

  const tunedCar = baseCar;
  tunedCar.price = 12500;
  tunedCar.engine.horsepower = 200;

  expect(
    getChangedPaths({
      comparison: "shallow",
      newState: tunedCar,
      oldState: baseCar,
    })
  ).toEqual([]);
});
