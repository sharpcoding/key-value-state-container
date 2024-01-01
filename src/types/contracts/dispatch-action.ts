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
