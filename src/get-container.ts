import { containerRegistered } from "./container-registered";
import { containers } from "./containers";
import { GetContainer } from "./types/contracts";

/**
 * Gets the state of the container (an object).
 *
 * This function is a simple and "low-cost" read operation,
 * immediate, causing no side effects.
 * 
 * Please do not modify the returned state object.
 *
 * Example state (abstraction in memory):
 * 
 * ```
 * Object ("EV")
 * +- "power" (object)
 * |  +- "currentConsumption" (number): 15
 * |  +- "rangeLeft" (number): 225
 * +- "wheels" (array)
 *    +- "frontLeftPressure" (number): 2.2
 *    +- "frontRightPressure" (number): 2.2
 *    +- "backLeftPressure" (number): 2.1
 *    +- "backRightPressure" (number): 2.3
 * ```
 * 
 * Anti-pattern:
 * ```
 * const { power } = getContainer({ containerId: "ev-20214553" });
 * // DO NOT DO THIS!
 * power.currentConsumption = 0;
 * ```
 * 
 * Modifying the state object returned by `getContainer()` function
 * as described above won't invoke any state listeners (callbacks), 
 * moreover, might lead to unexpected behavior (in the client application).
 * 
 * There is a dedicated (official) `updateStateContainer()` function for 
 * modifying the state container.
 */
export const getContainer: GetContainer = (args) => {
  const { containerId, ignoreUnregistered } = args;
  if (
    !containerRegistered({
      containerId,
    })
  ) {
    if (ignoreUnregistered) {
      return {};
    }
    throw new Error(`Container ${containerId} is unregistered`);
  }
  const container = containers[containerId];
  return { ...container.newState, ...container.immediateState };
};
