/**
 * The MIT License (MIT)
 * 
 * Copyright Tomasz Szatkowski and WealthArc https://www.wealtharc.com (c) 2023 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
