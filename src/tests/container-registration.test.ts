import _ from "lodash";

import { getContainer } from "../get-container";
import { registerStateContainer } from "../register-state-container";
import { unregisterStateContainer } from "../unregister-state-container";

const containerId = "typical-registration-do-nothing-container";

import { Action, State, reducer } from "./state-container/do-nothing-logic";

test("throws an error for unregistered container", () => {
  try {
    expect(getContainer<State>({ containerId }));
  } catch (e) {
    expect(e).toBeDefined();
  }
});

test("does not throw an error for unregistered container if asked so", () => {
  expect(
    getContainer<State>({ containerId, ignoreUnregistered: true })
  ).toEqual({});
});

test("non-keeping state container registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 10 },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  expect(sum).toEqual(10);
});

test("non-keeping state container re-registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 20 },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  expect(sum).toEqual(20);
});

test("non-keeping state container registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 30 },
    config: {
      keepState: true,
    },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  // see the sum is still 20, because if container is persistent,
  // it persists its state no matter how many times you re-register it
  expect(sum).toEqual(20);
});

test("non-keeping state container re-registers properly", async () => {
  registerStateContainer<State, Action>({
    containerId,
    initialState: { sum: 40 },
    reducer,
  });

  const { sum } = getContainer<State>({ containerId });
  expect(sum).toEqual(40);
});

test("container unregisters properly", async () => {
  unregisterStateContainer({
    containerId,
  });

  try {
    expect(getContainer<State>({ containerId }));
  } catch (e) {
    expect(e).toBeDefined();
  }
  expect(
    getContainer<State>({ containerId, ignoreUnregistered: true })
  ).toEqual({});
});
