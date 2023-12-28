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

import {
  Action,
  dispatchActions,
  reducer,
  State,
} from "./common/enhanced-logic";
import { finishedProcessingQueue } from "../auxiliary/action-queue-operations";
import { registerActionDispatchedCallback } from "../register-action-dispatched-callback";
import { registerStateChangedCallback } from "../register-state-changed-callback";
import { registerStateContainer } from "../register-state-container";
import { unregisterActionDispatchedCallback } from "../unregister-action-dispatched-callback";
import { unregisterStateChangedCallback } from "../unregister-state-changed-callback";
import { unregisterStateContainer } from "../unregister-state-container";
import { containers } from "../containers";

const containerId = "add-remove-counter-container";

beforeEach(() => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { increments: 0, decrements: 0, sum: 0 },
    reducer,
  });
});

afterEach(() => {
  unregisterStateContainer({ containerId });
});

test("state changed listener registration throws an error for unregistered container", async () => {
  unregisterStateContainer({ containerId });
  try {
    registerStateChangedCallback<State, Action>({
      callback: () => {},
      containerId,
      statePath: "decrements",
      listenerId: `decrement-listener-${0}`,
    });
  } catch (e) {
    expect(e).toBeDefined();
  }
});

test("action dispatching listener registration throws an error for unregistered container", async () => {
  unregisterStateContainer({ containerId });
  try {
    registerActionDispatchedCallback<State, Action>({
      action: {
        name: "zero",
      },
      callback: () => {},
      containerId,
      listenerId: `zero-listener-${0}`,
    });
  } catch (e) {
    expect(e).toBeDefined();
  }
});

test("all registered state and action listeners for named path are getting notified", async () => {
  const numberOfListeners = _.random(500, 5000);
  const randomArray: number[] = Array.from({ length: 1000 }, () =>
    _.random(-10, 10)
  );
  let invokedZeroActions = 0;
  let invokedDecrements = 0;
  let invokedIncrements = 0;
  let invokedSumListeners = 0;
  let invokedSumLateInvokeListeners = 0;

  const registerListenersForIndex = (i: number) => {
    registerStateChangedCallback<State, Action>({
      callback: () => {
        invokedDecrements++;
      },
      containerId,
      statePath: "decrements",
      listenerId: `decrement-listener-${i}`,
    });
    registerStateChangedCallback<State, Action>({
      callback: () => {
        invokedIncrements++;
      },
      containerId,
      statePath: "increments",
      listenerId: `increment-listener-${i}`,
    });
    registerStateChangedCallback<State, Action>({
      callback: () => {
        invokedSumListeners++;
      },
      containerId,
      statePath: "sum",
      listenerId: `sum-listener-${i}`,
    });
    registerStateChangedCallback<State, Action>({
      callback: () => {
        invokedSumLateInvokeListeners++;
      },
      containerId,
      lateInvoke: true,
      statePath: "sum",
      listenerId: `late-invoke-sum-listener-${i}`,
    });
    registerActionDispatchedCallback<State, Action>({
      action: {
        name: "zero",
      },
      callback: () => {
        invokedZeroActions++;
      },
      containerId,
      listenerId: `zero-listener-${i}`,
    });
  };

  const expectedDecrements = randomArray.filter((el) => el < 0).length;
  const expectedIncrements = randomArray.filter((el) => el > 0).length;
  const expectedZeros = randomArray.filter((el) => el === 0).length;

  // registering listeners
  for (let i = 0; i < numberOfListeners; i++) {
    registerListenersForIndex(i);
  }
  // now, randomly override some of the listeners!
  for (let i = 0; i < numberOfListeners; i++) {
    if (_.random(0, 100) < 20) {
      registerListenersForIndex(i);
    }
  }

  dispatchActions({ containerId, randomArray });
  await finishedProcessingQueue({ containerId });

  expect(invokedIncrements).toEqual(numberOfListeners * expectedIncrements);
  expect(invokedDecrements).toEqual(numberOfListeners * expectedDecrements);
  expect(invokedSumListeners).toEqual(
    numberOfListeners * (randomArray.length - expectedZeros)
  );
  expect(invokedSumLateInvokeListeners).toEqual(numberOfListeners);
  expect(invokedZeroActions).toEqual(numberOfListeners * expectedZeros);

  // unregistering all listeners
  for (let i = 0; i < numberOfListeners; i++) {
    unregisterStateChangedCallback<State>({
      containerId,
      listenerId: `decrement-listener-${i}`,
      statePath: "decrements",
    });
    unregisterStateChangedCallback<State>({
      containerId,
      listenerId: `increment-listener-${i}`,
      statePath: "increments",
    });
    unregisterStateChangedCallback<State>({
      containerId,
      listenerId: `sum-listener-${i}`,
      statePath: "sum",
    });
    unregisterStateChangedCallback<State>({
      containerId,
      lateInvoke: true,
      listenerId: `late-invoke-sum-listener-${i}`,
      statePath: "sum",
    });
    unregisterActionDispatchedCallback<Action>({
      action: {
        name: "zero",
      },
      containerId,
      listenerId: `zero-listener-${i}`,
    });
  }

  invokedIncrements = 0;
  invokedDecrements = 0;
  invokedSumListeners = 0;
  invokedSumLateInvokeListeners = 0;
  invokedZeroActions = 0;

  // send again the same actions - this time no one is listening...
  dispatchActions({ containerId, randomArray });
  await finishedProcessingQueue({ containerId });

  expect(invokedIncrements).toEqual(0);
  expect(invokedDecrements).toEqual(0);
  expect(invokedSumListeners).toEqual(0);
  expect(invokedSumLateInvokeListeners).toEqual(0);
  expect(invokedZeroActions).toEqual(0);

  const container = containers[containerId];
  const unregisteredListeners = Object.keys(container.listeners).reduce(
    (acc, key) => {
      return (
        acc + container.listeners[key].filter((el) => el !== undefined).length
      );
    },
    0
  );
  expect(unregisteredListeners).toEqual(0);
});
