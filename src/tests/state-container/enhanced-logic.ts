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
