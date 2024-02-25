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

import { names } from "./common/names";

import { dispatchAction } from "../dispatch-action/dispatch-action";
import { finishedProcessingQueue } from "../auxiliary/action-queue-operations";
import { Reducer } from "../types/contracts/reducer";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";
import { getContainer } from "../get-container";
import { AutoState } from "index-for-documentation";

type Action = {
  name: "add-name";
  payload: string;
};

type State = {
  namesArray: string[];
  namesLookup: Record<string, number>;
};

const autoState: AutoState<State, Action> = ({ newState, action }) => {
  if (action.name === "add-name") {
    const name = action.payload;
    const { namesLookup } = newState;
    const result: State = {
      ...newState,
      namesLookup: {
        ...namesLookup,
        [name]: namesLookup[name] ? namesLookup[name] + 1 : 1,
      },
    };
    return result;
  }
  return newState;
};

const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
    case "add-name": {
      const name = action.payload;
      const { namesArray } = state;
      const result: State = {
        ...state,
        namesArray: [...namesArray, name],
      };
      return result;
    }
    default: {
      return state;
    }
  }
};

const containerId = "names-lookup-container";

beforeEach(() => {
  registerStateContainer<State, Action>({
    autoState,
    containerId,
    initialState: { namesArray: [], namesLookup: {} },
    reducer,
  });
});

afterEach(() => {
  unregisterStateContainer({ containerId });
});

test("auto-state properly recalculates names lookup", async () => {
  const randomNames: string[] = Array.from(
    { length: 1000 },
    () => names[_.random(0, names.length - 1)]
  );
  const namesLookup: Record<string, number> = {};
  for (const name of randomNames) {
    if (namesLookup[name]) {
      namesLookup[name]++;
    } else {
      namesLookup[name] = 1;
    }
    dispatchAction<State, Action>({
      action: { name: "add-name", payload: name },
      containerId,
    });
  }

  await finishedProcessingQueue({ containerId });

  expect(
    JSON.stringify(getContainer<State>({ containerId }).namesLookup)
  ).toEqual(JSON.stringify(namesLookup));
});
