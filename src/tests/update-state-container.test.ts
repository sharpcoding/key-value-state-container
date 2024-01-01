import _ from "lodash";
import { Action } from "../types/contracts";
import { getContainer } from "../get-container";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";
import { updateStateContainer } from "../update-state-container";
import { Car } from "./common/car";

const containerId = "car-container";

const initialState: Car = {
  engine: {
    horsepower: 100,
    cylinders: 4,
  },
  body: {
    type: "sedan",
    color: "black",
  },
  status: "working",
  year: 1990,
};

beforeAll(() => {
  registerStateContainer<Car, Action>({
    containerId,
    initialState,
    reducer: async ({ state }) => state,
  });
});

afterAll(() => {
  unregisterStateContainer({
    containerId,
  });
});

test("updating state container with empty object does not change the state container", async () => {
  updateStateContainer<Car>({
    containerId: "car-container",
    state: {},
  });

  expect(JSON.stringify(getContainer<Car>({ containerId }))).toEqual(
    JSON.stringify(initialState)
  );
});

test("state container get properly updated with partial object", async () => {
  updateStateContainer<Car>({
    containerId: "car-container",
    state: {
      year: 1993,
      body: {
        color: "red",
        type: "coupe",
      },
    },
  });
  const updatedCar = getContainer<Car>({ containerId });

  expect(JSON.stringify(updatedCar)).not.toEqual(JSON.stringify(initialState));
  expect(updatedCar.year).toEqual(1993);
  expect(updatedCar.body.color).toEqual("red");
  expect(updatedCar.body.type).toEqual("coupe");
});
