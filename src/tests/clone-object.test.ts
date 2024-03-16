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
