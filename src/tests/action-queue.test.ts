import _ from "lodash";

import { Action, reducer, State } from "./state-container/enhanced-logic";
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

test("adding and processing some random actions", async () => {
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
    name: addedActions[actionsToAddLength - 1].name,
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
