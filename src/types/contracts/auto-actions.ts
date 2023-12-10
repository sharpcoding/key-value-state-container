import { Action } from "./action";

export interface AutoActions<TState extends Object, TAction extends Action> {
  (args: {
    action: TAction;
    changedPaths: (keyof TState)[];
    newState: TState;
    oldState: TState;
  }): TAction[];
}
