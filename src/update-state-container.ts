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
