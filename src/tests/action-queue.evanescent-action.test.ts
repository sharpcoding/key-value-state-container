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
import { Reducer } from "../types/contracts";

import { clearAllEnqueuedActions, enqueueAction } from "../auxiliary/action-queue-operations";
import { containers } from "../containers";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";

const containerId = "ui-events-state-container";

type MousePosition = {
  x: number;
  y: number;
};

type Dimensions = {
  height: number;
  width: number;
};

export type Action =
  | {
      evanescent: boolean;
      name: "form-resized";
      payload: Dimensions;
    }
  | {
      evanescent: boolean;
      name: "mouse-moved";
      payload: MousePosition;
    }
  | {
      name: "add-number";
      payload: number;
    };

type ActionCounter = Record<Action["name"], number>;

const actions: Action["name"][] = ["add-number", "form-resized", "mouse-moved"];

export type State = {
  sum: number;
  lastMousePosition: MousePosition;
  formDimensions: Dimensions;
};

export const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
    case "add-number": {
      return {
        ...state,
        sum: state.sum + action.payload,
      };
    }
    case "form-resized": {
      return {
        ...state,
        formDimensions: action.payload,
      };
    }
    case "mouse-moved": {
      return {
        ...state,
        lastMousePosition: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

beforeEach(() => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: {
      formDimensions: { height: 0, width: 0 },
      lastMousePosition: {
        x: 0,
        y: 0,
      },
      sum: 0,
    },
    reducer,
  });
});

afterEach(() => {
  unregisterStateContainer({ containerId });
});

test("action queue evanescent actions are handled properly", async () => {
  const maxActions = _.random(0, 1000);

  let counter: ActionCounter = {
    "add-number": 0,
    "form-resized": 0,
    "mouse-moved": 0,
  };
  let lastFromResizedAction: Action | undefined = undefined;
  let lastMouseMovedAction: Action | undefined = undefined;

  do {
    const action = (() => {
      const actionName = actions[_.random(0, actions.length - 1)];
      switch (actionName) {
        case "add-number": {
          counter["add-number"]++;
          return {
            name: actionName,
            payload: _.random(0, 5000),
          };
        }
        case "form-resized": {
          counter["form-resized"]++;
          const result = {
            evanescent: true,
            name: actionName,
            payload: {
              height: _.random(0, 5000),
              width: _.random(0, 5000),
            },
          };
          lastFromResizedAction = result;
          return result;
        }
        case "mouse-moved": {
          counter["mouse-moved"]++;
          const result = {
            evanescent: true,
            name: actionName,
            payload: {
              x: _.random(0, 5000),
              y: _.random(0, 5000),
            },
          };
          lastMouseMovedAction = result;
          return result;
        }
      }
    })();

    enqueueAction({
      action,
      containerId,
    });
  } while (
    counter["add-number"] + counter["form-resized"] + counter["mouse-moved"] <
    maxActions
  );

  const actionQueueContext = containers[containerId].actionQueueContext;

  expect(actionQueueContext.currentlyExecutingActionIndex).toEqual(-1);
  expect(
    actionQueueContext.queue.filter((el) => typeof el !== "undefined").length
  ).toEqual(
    counter["add-number"] +
      (counter["form-resized"] ? 1 : 0) +
      (counter["mouse-moved"] ? 1 : 0)
  );

  expect(
    actionQueueContext.queue.filter((a) => a?.name === "form-resized").length
  ).toBeLessThanOrEqual(1);
  expect(
    actionQueueContext.queue.filter((a) => a?.name === "mouse-moved").length
  ).toBeLessThanOrEqual(1);

  clearAllEnqueuedActions({ containerId });
});
