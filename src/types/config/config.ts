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

import { ConfigDebugSection } from "./config-debug-section";

/**
 * Optional (yet useful) configuration for state container
 */
export interface Config<TState extends Object> {
  /**
   * @default 1000
   */
  actionQueueMaxLength?: number;

  /**
   * Configure the information to get displayed in console (for now 
   * it is the only place where this kind of the information is displayed). 
   */
  debug?: ConfigDebugSection;

  /**
   * Experimental feature.
   * Identify attributes that get managed completely by the state container!
   * Set them here, but do not modify them in the reducer function!
   */
  managedAttributes?: {
    /**
     * Indicate a `boolean` attribute in state that would act as
     * an "asynchronous operation underway" flag.
     *
     * When an async action starts dispatching, field is set to `true`
     * (and listeners that listen to path indicated by the field invoked).
     *
     * When (the very same) an async action finished dispatching, 
     * this field is set to `false` 
     * (listeners that listen to path indicated by the field invoked).
     */
    asyncOperationFlag?: keyof TState;
  };

  /**
   * Makes container state immune to calling `registerStateContainer` function
   * multiple times.
   * 
   * If set to true, other calls (but first) to registerStateContainer 
   * function won't override existing container state with initial state once again.
   * 
   * In fact, treat this rather as a debug flag, as it is rather unnecessary to call 
   * `registerStateContainer` function with `keepState` set to `true`. If so, 
   * it might be a sign something with container registration is not OK.
   * 
   * Setting does not affect `unregisterStateContainer` function - once "unregister" 
   * gets called, the state gets removed.
   * 
   * @default false
   */
  keepState?: boolean;

  /**
   * If set to `true`, the `state` argument passed in the `reducer` function will 
   * be a cloned copy of the current state, not the state as it is in the container.
   * 
   * Please read the documentation for the `registerStateContainer` function, 
   * `config` arg.
   * 
   * Keep in mind mutating the state might be a good thing actually in some cases
   * (especially from performance point of view), providing working/correct solution.
   * 
   * Please take into account the state object containing (callback) functions 
   * (more advanced scenarios) will not work with this flag,
   * as objects containing functions cannot be cloned. 
   * 
   * @default: true
   */
  protectState?: boolean;
};
