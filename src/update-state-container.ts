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

import { Config } from "./types/config";
import { containers } from "./containers";

/**
 * A "special" function to instantly modify a registered state container.
 * 
 * The caveats: 
 * - `reducer` does not get called, so the state gets modified beyond `reducer` 
 * - as the consequence, no callback listeners (registered with either `registerStateChangedCallback()` 
 *   or registerActionDispatchedCallback()`) get invoked.
 *
 * This "special" way of modifying state container shouldn't be used 
 * in the most circumstances, because modifying the state pulls out the logic 
 * outside the reducer.
 * 
 * The recommended and typical scenario is as the following:
 * - dispatch an action (by calling `dispatchAction()` function)
 * - (state container takes the responsibility) to call the `reducer`
 * - `reducer` gets processed and a new state object is created
 * - (in the most of cases) a fragment of state is modified
 * - a top level attributes change get detected
 * - appropriate listeners get invoked
 * - UI gets refreshed/repainted etc.
 * - all this above can get logged to the Web Developer Console
 * 
 * There are cases when you want to modify the state container directly, 
 * make it "silently" and immediately: in most cases because of performance optimizations.
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
