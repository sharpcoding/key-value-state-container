import { Action } from "./action";
import { Config } from "../config";
import { AutoActions } from "./auto-actions";
import { Reducer } from "./reducer";
import { StateContainerPersistence } from "./state-container-persistence";

export interface RegisterStateContainerArgs<
  TState extends Object,
  TAction extends Action
> {
  /**
   * Optional "factory" function that produces (returns) array of actions to be
   * added to action queue AFTER a a particular action finished execution.
   * These actions are added to the queue only if the state has changed.
   * 
   * If there are no actions to be produced, return empty array
   */
  autoActions?: AutoActions<TState, TAction>;

  /**
   * Set globally unique id for container
   */
  containerId: string;
  config?: Config<TState>;
  /**
   * Initial state can be a simple object (most of the cases).
   * 
   * If `initialState` is a function, it gets invoked automatically 
   * and the effect is initial state.
   */
  initialState: TState | ((persistedState: Partial<TState>) => TState);
  reducer: Reducer<TState, TAction>;

  /**
   * Optional (and advanced!) persistence configuration
   */
  persistence?: StateContainerPersistence<TState>;
}

export interface RegisterStateContainer {
  <TState extends Object, TAction extends Action>(
    args: RegisterStateContainerArgs<TState, TAction>
  ): void;
}
