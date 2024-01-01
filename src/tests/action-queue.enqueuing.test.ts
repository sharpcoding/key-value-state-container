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

import { Action, reducer, State } from "./common/calculator-logic";
import {
  actionInQueue,
  actionInQueueStatus,
  clearAllEnqueuedActions,
  enqueueAction,
} from "../auxiliary/action-queue-operations";
import { containers } from "../containers";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";

const containerId = "add-remove-counter-container-for-action-queue-tests";

const actions = [
  {
    name: "decrement",
    payload: 1,
  },
  {
    name: "increment",
    payload: 1,
  },
  {
    name: "zero",
    bypassReducer: true,
  },
] as Action[];

beforeEach(() => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { increments: 0, decrements: 0, sum: 0 },
    reducer,
  });
});

afterEach(() => {
  clearAllEnqueuedActions({ containerId });
  unregisterStateContainer({ containerId });
});

test("action queue action status is calculated correctly", async () => {
  expect(
    actionInQueue({
      containerId,
      name: "increment",
    })
  ).toEqual(false);

  const actionsToAddLength = _.random(0, 50);
  const addedActions = Array.from({ length: actionsToAddLength }, () => {
    return actions[_.random(0, actions.length - 1)];
  });
  for (let i = 0; i < addedActions.length; i++) {
    enqueueAction({
      action: addedActions[i],
      containerId,
    });
  }

  const { status: status1 } = actionInQueueStatus({
    containerId,
    name: addedActions[actionsToAddLength - 1]?.name,
  });
  expect(status1).toEqual("enqueued-for-later-execution");
  expect(containers[containerId].actionQueueContext.lastActionIndex).toEqual(
    addedActions.length - 1
  );
  expect(
    containers[containerId].actionQueueContext.currentlyExecutingActionIndex
  ).toEqual(-1);

  const { status: status2 } = actionInQueueStatus({
    containerId,
    name: addedActions[_.random(0, actionsToAddLength - 1)].name,
  });
  expect(status2).toEqual("enqueued-for-later-execution");
});
