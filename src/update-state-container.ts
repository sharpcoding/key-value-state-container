import { Config } from "./types/config";
import { containers } from "./containers";

/**
 * Function to "silently" modify the state container.
 * Causes no side effects and has immediate effect.
 *
 * In the most cases you shouldn't use it, as the typical 
 * scenario is as the following:
 * - dispatch an action (by calling `dispatchAction()` function)
 * - (state container takes the responsibility) to calls for a reducer
 * - reducer gets processed and a new state object is returned
 * - (in 99% of cases) a fragment of state is modified (related to the old state)
 * - and this change is detected
 * - appropriate listeners are invoked
 * - UI gets repainted etc.
 * - optionally, all this can get logged to the Web Developer Console
 * 
 * But there are cases when you want to modify the state container directly
 * and make it "silently" and immediately.
 */
export const updateStateContainer = <
  TState extends Object
>(args: {
  /**
   * The id of the container to update.
   * Container must be registered before.
   */
  containerId: string;
  /**
   * The new config of the container.
   */
  config?: Config<TState>;
  /**
   * The new state of the container.
   * 
   * Please note, you don't have to provide the whole state,
   * but only necessary set of attributes.
   */
  state?: Partial<TState>;
}) => {
  const { config, containerId, state } = args;
  const container = containers[containerId];
  if (!container) {
    console.warn(`Container ${containerId} not found!`);
  }
  if (config) {
    container.config = config;
  }
  if (state) {
    container.newState = { ...container.newState, ...state };
    container.immediateState = { ...container.newState, ...state };
  }
};
