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

import { Action } from "../types/contracts/action";
import { containers } from "../containers";
import { ACTION_QUEUE_DEFAULT_SIZE } from "../consts";
import {
  AutoActions,
  AutoState,
  Reducer,
  RegisterStateContainerArgs,
} from "../types/contracts";
import { cloneObject } from "../auxiliary/clone-object";
import { registerStateContainerErrorsAndWarnings } from "./register-state-container-errors-and-warnings.logging";

interface Args<TState extends Object, TAction extends Action>
  extends Omit<RegisterStateContainerArgs<TState, TAction>, "config">,
    Required<Pick<RegisterStateContainerArgs<TState, TAction>, "config">> {
  initialState: TState;
}

export const properRegistration = <
  TState extends Object,
  TAction extends Action
>({
  autoActions,
  autoState,
  containerId,
  config,
  initialState,
  reducer,
  persistence,
}: Args<TState, TAction>) => {
  const oldState = cloneObject(initialState);
  const newState = cloneObject(initialState);
  containers[containerId] = {
    actionQueueContext: {
      currentlyExecutingActionIndex: -1,
      lastActionIndex: -1,
      lookup: {},
      queue: Array.from(
        {
          length: config?.actionQueueMaxLength || ACTION_QUEUE_DEFAULT_SIZE,
        },
        () => undefined
      ),
    },
    autoActions: autoActions as AutoActions<any, Action> | undefined,
    autoState: autoState as AutoState<any, Action> | undefined,
    changedPaths: [],
    id: containerId,
    config,
    reducer: reducer as Reducer<any, Action> | undefined,
    lateInvokeChangedPaths: [],
    listeners: {},
    listenerIdToIndexReference: {},
    listenerIndexToIdReference: {},
    oldState,
    newState,
    persistence,
  };

  /* istanbul ignore next */
  if (config?.debug?.registration?.container?.registering) {
    console.log(`Container with id ${containerId} registered`);
    if (config?.debug?.registration?.container?.callstack) {
      console.trace("registerStateContainer()");
    }
  }

  registerStateContainerErrorsAndWarnings({
    container: containers[containerId],
  })
};
