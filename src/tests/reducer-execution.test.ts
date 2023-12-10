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

import { containers } from "../containers";
import { dispatchAction } from "../dispatch-action/dispatch-action";
import { finishedProcessingQueue } from "../auxiliary/action-queue-operations";
import { getContainer } from "../get-container";
import { Reducer } from "../types/contracts/reducer";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";

type Action =
  | {
      name: "increment";
      payload: number;
    }
  | {
      name: "decrement";
      payload: number;
    };

type State = { sum: number };

const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
    case "decrement": {
      return {
        ...state,
        sum: state.sum - action.payload,
      };
    }
    case "increment": {
      return {
        ...state,
        sum: state.sum + action.payload,
      };
    }
  }
};

const containerId = "add-remove-counter-container";


beforeEach(() => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 0 },
    reducer,
  });
});

afterEach(() => {
  unregisterStateContainer({ containerId });
});


registerStateContainer<State, Action>({
  containerId,
  initialState: { sum: 0 },
  reducer,
});

test("random array of numbers are summed properly", async () => {
  const randomArray = Array.from({ length: 1000 }, () => _.random(-5000, 5000));
  const expectedSum = randomArray.reduce((acc, curr) => acc + curr, 0);
  for (let i = 0; i < randomArray.length; i++) {
    dispatchAction<State, Action>({
      action: {
        name: randomArray[i] > 0 ? "increment" : "decrement",
        payload: Math.abs(randomArray[i]),
      },
      containerId,
    });
  }
  await finishedProcessingQueue({ containerId });
  expect(getContainer<State>({ containerId }).sum).toEqual(expectedSum);
});

test("low level container indices are set properly", async () => {
  const container = containers[containerId];
  expect(container.actionQueueContext.currentlyExecutingActionIndex).toEqual(
    -1
  );
  expect(container.actionQueueContext.lastActionIndex).toEqual(-1);
});
