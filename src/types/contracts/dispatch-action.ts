import { Action } from "./action";

/**
 * @ignore
 * Contract for the `dispatchAction` function.
 */
export interface DispatchAction {
  <TState extends Object, TAction extends Action>(
    args: {
      /**
       * The action object
       */
      action: TAction;
      /**
       * The id of the container to which the action should be dispatched.
       * If the container is not registered, the function will print a message,
       * but will not throw an error.
       */
      containerId: string;
      /**
       * Implements advanced scenario, in most cases you can ignore this.
       *
       * Sets some selected attributes to state "immediately"
       * before waiting for `action` to get completely executed.
       * 
       * The `immediateState` is a kind of "promise" the
       * state (whole or particular attributes) will look like declared
       * AFTER the action gets executed (`await reducer()` call gets done).
       * 
       * Where it can be useful: in some of the React "asynchronous" aspects,
       * where `getContainer()` calls might return inappropriate state.
       */
      immediateState?: Partial<TState>;
    }
  ): void;
}
