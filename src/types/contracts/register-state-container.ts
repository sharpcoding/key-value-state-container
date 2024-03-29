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
import { Config } from "../config";
import { AutoActions } from "./auto-actions";
import { Reducer } from "./reducer";
import { StateContainerPersistence } from "./state-container-persistence";
import { AutoState } from "./auto-state";

export interface RegisterStateContainerArgs<
  TState extends Object,
  TAction extends Action
> {
  /**
   * Please read the `AutoActions` interface for more details.
   */
  autoActions?: AutoActions<TState, TAction>;

  /**
   * Please read the `AutoState` interface for more details.
   */
  autoState?: AutoState<TState, TAction>;

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
