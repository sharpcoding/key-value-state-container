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

import { getContainer } from "../get-container";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";

const containerId = "typical-registration-do-nothing-container";

import { Action, State, reducer } from "./common/do-nothing-logic";

test("throws an error for unregistered container", () => {
  try {
    expect(getContainer<State>({ containerId }));
  } catch (e) {
    expect(e).toBeDefined();
  }
});

test("does not throw an error for unregistered container if asked so", () => {
  expect(
    getContainer<State>({ containerId, ignoreUnregistered: true })
  ).toEqual({});
});

test("non-keeping state container registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 10 },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  expect(sum).toEqual(10);
});

test("non-keeping state container re-registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 20 },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  expect(sum).toEqual(20);
});

test("non-keeping state container registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 30 },
    config: {
      keepState: true,
    },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  // see the sum is still 20, because if container is persistent,
  // it persists its state no matter how many times you re-register it
  expect(sum).toEqual(20);
});

test("non-keeping state container re-registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 40 },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  expect(sum).toEqual(40);
});

test("container unregisters properly", async () => {
  unregisterStateContainer({
    containerId,
  });

  try {
    expect(getContainer<State>({ containerId }));
  } catch (e) {
    expect(e).toBeDefined();
  }
  expect(
    getContainer<State>({ containerId, ignoreUnregistered: true })
  ).toEqual({});
});
