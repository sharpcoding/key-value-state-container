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

import { dispatchAction } from "../../dispatch-action/dispatch-action";
import { Reducer } from "../../types/contracts/reducer";

/**
 * The enhanced logic adds a special action `zero` that bypasses the reducer.
 */
export type Action =
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

export type State = {
  sum: number;
  /**
   * How many times the `increment` action has been dispatched.
   */
  increments: number;
  /**
   * How many times the `decrement` action has been dispatched.
   */
  decrements: number;
};

export const reducer: Reducer<State, Action> = async ({ state, action }) => {
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

export const dispatchActions = ({
  containerId,
  randomArray,
}: {
  containerId: string;
  randomArray: number[];
}) => {
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
