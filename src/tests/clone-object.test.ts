import { cloneObject } from "../auxiliary/clone-object";
import { BlackBox, Car, Moving } from "./common/car";

const baseCar: BlackBox & Car = {
  engine: {
    horsepower: 100,
    cylinders: 4,
  },
  body: {
    type: "sedan",
    color: "black",
  },
  events: ["started", "accelerated", "braked", "stopped"],
  status: "working",
  year: 1990,
};

test("clone objects", async () => {
  const clonedCar = cloneObject(baseCar);
  expect(baseCar.body !== clonedCar.body).toEqual(true);
  expect(baseCar.engine !== clonedCar.engine).toEqual(true);
  expect(baseCar.events.length === clonedCar.events.length).toEqual(true);
  expect(baseCar.events !== clonedCar.events).toEqual(true);
});

test("cannot clone objects with functions", async () => {
  const movingCar: BlackBox & Car & Moving = {
    ...baseCar,
    start: () => {
      console.log("starting car");
    },
    stop: () => {
      console.log("stopping car");
    },
  };
  try {
    cloneObject(movingCar);
  } catch (e) {
    expect(e).toBeDefined();
  }
});
