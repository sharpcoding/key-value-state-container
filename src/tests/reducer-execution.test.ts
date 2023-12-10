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
