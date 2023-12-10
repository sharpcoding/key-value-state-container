import _ from "lodash";

import {
  Action,
  dispatchActions,
  reducer,
  State,
} from "./state-container/enhanced-logic";
import { finishedProcessingQueue } from "../auxiliary/action-queue-operations";
import { registerActionDispatchedCallback } from "../register-action-dispatched-callback";
import { registerStateChangedCallback } from "../register-state-changed-callback";
import { registerStateContainer } from "../register-state-container";
import { unregisterActionDispatchedCallback } from "../unregister-action-dispatched-callback";
import { unregisterStateChangedCallback } from "../unregister-state-changed-callback";
import { unregisterStateContainer } from "../unregister-state-container";

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
  expect(invokedZeroActions).toEqual(numberOfListeners * expectedZeros);

  // unregistering all listeners
  for (let i = 0; i < numberOfListeners; i++) {
    unregisterStateChangedCallback<State>({
      containerId,
      statePath: "decrements",
      listenerId: `decrement-listener-${i}`,
    });
    unregisterStateChangedCallback<State>({
      containerId,
      statePath: "increments",
      listenerId: `increment-listener-${i}`,
    });
    unregisterStateChangedCallback<State>({
      containerId,
      statePath: "sum",
      listenerId: `sum-listener-${i}`,
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
  invokedZeroActions = 0;

  // send again the same actions - this time no one is listening...
  dispatchActions({ containerId, randomArray });
  await finishedProcessingQueue({ containerId });

  expect(invokedIncrements).toEqual(0);
  expect(invokedDecrements).toEqual(0);
  expect(invokedSumListeners).toEqual(0);
  expect(invokedZeroActions).toEqual(0);
});
