import _ from "lodash";

import { dispatchAction } from "../dispatch-action/dispatch-action";
import { AutoActions } from "../types/contracts/auto-actions";
import { finishedProcessingQueue } from "../auxiliary/action-queue-operations";
import { getContainer } from "../get-container";
import { Reducer } from "../types/contracts/reducer";
import { registerStateContainer } from "../register-state-container";

type Action =
  | {
      name: "add";
      payload: number;
    }
  | {
      name: "increment-multiple-of-100";
    }
  | {
      name: "end-test";
    };

type State = {
  sum: number;
  /**
   * How many of the numbers in the sum are multiples of `100`
   * E.g. how many `100`, `200`, `300` etc. are in the random array
   */
  multiplesOfHundred: number;
};

const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
    case "add": {
      return {
        ...state,
        sum: state.sum + action.payload,
      };
    }
    case "increment-multiple-of-100": {
      return {
        ...state,
        multiplesOfHundred: state.multiplesOfHundred + 1,
      };
    }
    default: {
      return state;
    }
  }
};

const autoActions: AutoActions<State, Action> = ({ action }) => {
  switch (action.name) {
    case "add": {
      if (action.payload % 100 === 0) {
        return [
          {
            name: "increment-multiple-of-100",
          },
        ];
      }
      return [];
    }
    default: {
      return [];
    }
  }
};

const containerId = "add-array-of-numbers-container";

registerStateContainer<State, Action>({
  autoActions,
  containerId,
  initialState: { multiplesOfHundred: 0, sum: 0 },
  reducer,
});

const randomArray = Array.from({ length: 600 }, () => _.random(0, 10000));

test("random array of numbers is summed properly", async () => {
  const expectedSum = randomArray.reduce((acc, curr) => acc + curr, 0);
  for (let i = 0; i < randomArray.length; i++) {
    dispatchAction<State, Action>({
      action: {
        name: "add",
        payload: randomArray[i],
      },
      containerId,
    });
  }
  await finishedProcessingQueue({ containerId });
  const { sum } = getContainer<State>({ containerId });
  expect(sum).toEqual(expectedSum);
});

test("multiples of 100 are count properly (via auto-actions)", async () => {
  const multiples = randomArray.filter((n) => n % 100 === 0).length;
  const { multiplesOfHundred } = getContainer<State>({ containerId });
  expect(multiplesOfHundred).toEqual(multiples);
});
