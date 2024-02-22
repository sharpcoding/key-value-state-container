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

import { Action } from "./contracts/action";
import { ActionQueueContext } from "./action-queue-context";
import { Config } from "./config";
import { StateContainerPersistence } from "./contracts/state-container-persistence";
import { AutoActions } from "./contracts/auto-actions";
import { Reducer } from "./contracts/reducer";
import { AutoState } from "./contracts";

type StatePath = string;
type ListenerId = string;
type IndexOfListener = number;

interface ListenerCallback<TState extends Object, TAction extends Action> {
  (args: {
    action: TAction;
    changedPaths: string[];
    newState: TState;
    oldState: TState;
  }): void;
}

export type RegisteredOrUnregisteredListenerCallback<
  TState extends Object,
  TAction extends Action
> = ListenerCallback<TState, TAction> | undefined;

export interface ContainerInMemory<TState extends Object, TAction extends Action> {
  /**
   * action at the 0 index is currently executing
   * action at the 1 index is should get executed next... etc
   */
  actionQueueContext: ActionQueueContext<TAction>;
  autoActions?: AutoActions<TState, TAction>;
  autoState?: AutoState<TState, TAction>;
  /**
   * Special optimization flag.
   * If `true`, indicates `bypassReducer` action was enqueued 
   * for processing in the current batch
   */
  bypassReducerActionEnqueued?: boolean;
  changedPaths: string[];
  config: Config<TState>;
  id: string;
  listeners: Record<
    StatePath,
    RegisteredOrUnregisteredListenerCallback<TState, TAction>[]
  >;
  /**
   * Here we keep track of the paths that were changed during
   * the execution of the actions batch
   */
  lateInvokeChangedPaths: string[];
  listenerIdToIndexReference: Record<ListenerId, IndexOfListener>;
  listenerIndexToIdReference: Record<IndexOfListener, ListenerId>;
  immediateState?: TState;
  newState: TState;
  oldState: TState;
  reducer?: Reducer<TState, TAction>;
  persistence?: StateContainerPersistence<TState>;
}
