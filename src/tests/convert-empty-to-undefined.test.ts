import { convertEmptyToUndefined } from "../auxiliary/convert-empty-to-undefined";
import { BlackBox, Car } from "./common/car";

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

test("convertEmptyToUndefined() works", async () => {
  expect(convertEmptyToUndefined({})).toEqual(undefined);
  expect(convertEmptyToUndefined(baseCar)).not.toEqual(undefined);
});
