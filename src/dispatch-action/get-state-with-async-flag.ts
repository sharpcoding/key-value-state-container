import { Action } from "../types/contracts/action";

interface Args<TState extends Object, TAction extends Action> {
  action: TAction;
  asyncOperationFlag?: string | number | symbol;
  state: TState;
  asyncOperationFlagValue: boolean;
}

export const getStateWithAsyncFlag = <
  TState extends Object,
  TAction extends Action
>(
  args: Args<TState, TAction>
): TState => {
  const { action, asyncOperationFlag, state, asyncOperationFlagValue } = args;
  if (action.async && asyncOperationFlag) {
    return {
      ...state,
      [asyncOperationFlag]: asyncOperationFlagValue,
    };
  }
  return state;
};
