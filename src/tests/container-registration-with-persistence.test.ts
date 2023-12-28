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

import { PersistenceEnvelope } from "../types/persistence-envelope";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";
import {
  Action,
  State as StateVer1,
  reducer,
  dispatchActions,
} from "./common/enhanced-logic";
import { registerStateChangedCallback } from "../register-state-changed-callback";
import { finishedProcessingQueue } from "../auxiliary/action-queue-operations";
import { getContainer } from "../get-container";

const containerId = "with-persistence-registration-container";

interface StateVer2 extends StateVer1 {
  /**
   * Count all the increments and decrements
   */
  operations: number;
}

const memory: Record<string, PersistenceEnvelope> = {};
const persistenceKey = "sum-calculator";

const getEnvelope = (key: string) => {
  return memory[key] as PersistenceEnvelope;
};

const setEnvelope = (key: string, envelope: PersistenceEnvelope) => {
  memory[key] = envelope;
};

test("container registration with persistence", async () => {
  /**
   * "1.0.0" version of the state container
   */
  registerStateContainer<StateVer1, Action>({
    containerId: `${containerId}-v1`,
    initialState: { sum: 0, increments: 0, decrements: 0 },
    reducer,
    persistence: {
      attributes: ["sum", "increments", "decrements"],
      getKey: () => persistenceKey,
      getEnvelope,
      setEnvelope,
      version: "1.0.0",
    },
  });

  const numberOfListeners = _.random(500, 5000);
  const randomArray: number[] = Array.from({ length: 1000 }, () =>
    _.random(-10, 10)
  );
  const expectedSum = randomArray.reduce((acc, el) => acc + el, 0);

  const registerListenersForIndex = (i: number) => {
    registerStateChangedCallback<StateVer1, Action>({
      callback: () => {},
      containerId: `${containerId}-v1`,
      statePath: "sum",
      listenerId: `sum-listener-${i}`,
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

  dispatchActions({ containerId: `${containerId}-v1`, randomArray });
  await finishedProcessingQueue({ containerId: `${containerId}-v1` });

  expect(memory[persistenceKey]?.contents.sum).toEqual(expectedSum);

  unregisterStateContainer({
    containerId: `${containerId}-v1`,
  });

  /**
   * obviously, the memory should not change at all
   */
  expect(memory[persistenceKey].contents.sum).toEqual(expectedSum);

  /**
   * ...here comes "2.0.0" version of the container
   */
  registerStateContainer<StateVer2, Action>({
    containerId: `${containerId}-v2`,
    // initialState: { sum: 0, increments: 0, decrements: 0, operations: 0 },
    initialState: (x) => {
      const result: StateVer2 = {
        sum: x?.sum || 0,
        increments: x?.increments || 0,
        decrements: x?.decrements || 0,
        operations: x.operations || 0,
      };
      return result;
    },
    /**
     * reducer logic is irrelevant here
     */
    reducer: async ({ state }) => {
      return state;
    },
    persistence: {
      converter: ({ persistedState, version }) => {
        switch (version) {
          case "1.0.0": {
            const ver1State = persistedState as StateVer1;
            return {
              sum: ver1State.sum,
              increments: ver1State.increments,
              decrements: ver1State.decrements,
              operations: ver1State.increments + ver1State.decrements,
            };
          }
          default: {
            return {
              sum: 0,
              increments: 0,
              decrements: 0,
              operations: 0,
            };
          }
        }
      },
      attributes: ["sum"],
      getKey: () => persistenceKey,
      getEnvelope,
      setEnvelope,
      version: "2.0.0",
    },
  });

  /**
   * the new state container should have state from the previous version
   * persisted in storage
   */
  const state = getContainer<StateVer2>({ containerId: `${containerId}-v2` });
  expect(state.sum).toEqual(expectedSum);
});
