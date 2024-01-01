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

import { dispatchAction } from "../dispatch-action/dispatch-action";
import { finishedProcessingQueue } from "../auxiliary/action-queue-operations";
import { Reducer } from "../types/contracts/reducer";
import { registerStateChangedCallback } from "../register-state-changed-callback";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";
import { getContainer } from "../get-container";

type Action =
  | {
      name: "increment";
      payload: number;
    }
  | {
      name: "decrement";
      payload: number;
    }
  /**
   * If 0 gets fetched from `randomArray`, the state of the container will not change
   * (no increment, no decrement, no sum change).
   *
   * However, this special action will get dispatched.
   */
  | {
      name: "zero";
      bypassReducer: true;
    };

type State = {
  sum: number;
  increments: number;
  decrements: number;
};

const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
    case "decrement": {
      return {
        ...state,
        decrements: state.decrements + 1,
        sum: state.sum - action.payload,
      };
    }
    case "increment": {
      return {
        ...state,
        increments: state.increments + 1,
        sum: state.sum + action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

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

const dispatchActions = (randomArray: number[]) => {
  for (let i = 0; i < randomArray.length; i++) {
    if (randomArray[i] === 0) {
      dispatchAction<State, Action>({
        action: {
          name: "zero",
          bypassReducer: true,
        },
        containerId,
      });
    } else {
      dispatchAction<State, Action>({
        action: {
          name: randomArray[i] > 0 ? "increment" : "decrement",
          payload: Math.abs(randomArray[i]),
        },
        containerId,
      });
    }
  }
};

test("all registered state and action listeners for * are getting notified", async () => {
  const numberOfListeners = _.random(500, 5000);
  const randomArray: number[] = Array.from({ length: 1000 }, () =>
    _.random(-10, 10)
  );
  const expectedSum = randomArray.reduce((acc, el) => acc + el, 0);
  let invokedStatePathChangedCallbacks = 0;
  const numberOfZeros = randomArray.filter((el) => el === 0).length;

  const registerListenersForIndex = (i: number) => {
    registerStateChangedCallback<State, Action>({
      callback: () => {
        invokedStatePathChangedCallbacks++;
      },
      containerId,
      statePath: "*",
      listenerId: `any-path-change-listener-${i}`,
    });
  };

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

  dispatchActions(randomArray);
  await finishedProcessingQueue({ containerId });

  expect(getContainer<State>({ containerId })?.sum).toEqual(expectedSum);
  expect(invokedStatePathChangedCallbacks).toEqual(
    numberOfListeners * (randomArray.length - numberOfZeros)
  );
});

test("all registered state and action listeners for late invoke * are getting notified", async () => {
  const numberOfListeners = _.random(500, 5000);
  const randomArray: number[] = Array.from({ length: 1000 }, () =>
  _.random(-10, 10)
  );
  let invokedStatePathChangedCallbacks = 0;
  randomArray[999] = 0;
  
  const expectedSum = randomArray.reduce((acc, el) => acc + el, 0);

  const registerListenersForIndex = (i: number) => {
    registerStateChangedCallback<State, Action>({
      callback: () => {
        invokedStatePathChangedCallbacks++;
      },
      containerId,
      lateInvoke: true,
      statePath: "*",
      listenerId: `any-path-change-listener-${i}`,
    });
  };

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

  dispatchActions(randomArray);
  await finishedProcessingQueue({ containerId });
  expect(getContainer<State>({ containerId })?.sum).toEqual(expectedSum);
  expect(invokedStatePathChangedCallbacks).toEqual(numberOfListeners);
});
