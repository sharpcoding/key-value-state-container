/**
 * The MIT License (MIT)
 * 
 * Copyright Tomasz Szatkowski and WealthArc https://www.wealtharc.com (c) 2023 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { containerRegistered } from "./container-registered";
import { containers } from "./containers";
import { GetContainer } from "./types/contracts";

/**
 * Gets the state of the container (an object).
 *
 * Function operation is a simple and "low-cost" read-only operation,
 * evaluated immediately, causing no side effects. If possible, please 
 * prefer it over other ways of reading state 
 * (e.g `useSelector()` of `key-value-state-container-react`, 
 * which makes component re-render "listened to" attributes).
 * 
 * Do not modify the returned (state) object, as it will not invoke 
 * listeners (callbacks) (registered with `registerStateChangedCallback()` 
 * or `registerActionDispatchedCallback()`).
 * 
 * For modifying the state without sending actions, calling reducers 
 * and invoking listeners (callbacks), use `updateStateContainer()` 
 * (although it is not recommended).
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
 * To reiterate: modifying the state object returned by `getContainer()` function
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
    /* istanbul ignore next */
    throw new Error(`Container ${containerId} is unregistered`);
  }
  const container = containers[containerId];
  return { ...container.newState, ...container.immediateState };
};
