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

import {
  registerStateContainer,
  Reducer,
  dispatchAction,
  finishedProcessingQueue,
  getContainer,
  unregisterStateContainer,
} from "../index";

type Action =
  | {
      name: "step";
    }
  | { name: "reset" };

type State = {
  /**
   * finished steps
   */
  steps: number;
  /**
   * the Fibonacci sequence (result)
   */
  sequence: number[];
};

export const reducer: Reducer<State, Action> = async ({ state, action }) => {
  const { steps } = state;
  switch (action.name) {
    case "step": {
      if (steps < 3) {
        return {
          ...state,
          steps: steps + 1,
          sequence: [0, 1, 1].slice(0, steps + 1),
        };
      }
      return {
        ...state,
        steps: steps + 1,
        sequence: [
          ...state.sequence,
         state.sequence[steps - 1] + state.sequence[steps - 2],
        ],
      };
    }
    case "reset": {
      return { steps: 0, sequence: [] };
    }
    default: {
      return state;
    }
  }
};

const containerId = "fibonacci-container";

beforeAll(() => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { steps: 1, sequence: [] },
    reducer,
  });
});

afterAll(() => {
  unregisterStateContainer({ containerId });
});

/**
 * @param n as defined in https://en.wikipedia.org/wiki/Fibonacci_sequence
 */
const countFibonacciSequence = async (n: number) => {
  dispatchAction({
    containerId,
    action: { name: "reset" },
  });
  for (let i = 0; i <= n; i++) {
    dispatchAction({
      containerId,
      action: { name: "step" },
    });
  }
  await finishedProcessingQueue({ containerId });
  const { sequence } = getContainer<State>({ containerId });
  return sequence;
};

test("fibonacci sequence is calculated properly", async () => {
  expect(await countFibonacciSequence(0)).toEqual([0]);
  expect(await countFibonacciSequence(1)).toEqual([0, 1]);
  expect(await countFibonacciSequence(2)).toEqual([0, 1, 1]);
  expect(await countFibonacciSequence(3)).toEqual([0, 1, 1, 2]);
  expect(await countFibonacciSequence(4)).toEqual([0, 1, 1, 2, 3]);
  expect(await countFibonacciSequence(5)).toEqual([0, 1, 1, 2, 3, 5]);
  expect(await countFibonacciSequence(6)).toEqual([0, 1, 1, 2, 3, 5, 8]);
  expect(await countFibonacciSequence(7)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
  expect(await countFibonacciSequence(14)).toEqual([
    0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377,
  ]);
  expect(await countFibonacciSequence(32)).toEqual([
    0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597,
    2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811,
    514229, 832040, 1346269, 2178309,
  ]);
});
