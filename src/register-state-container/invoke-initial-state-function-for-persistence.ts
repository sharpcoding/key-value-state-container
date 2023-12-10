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

import _ from "lodash";

import { Action } from "../types/contracts/action";
import { PersistenceEnvelope } from "../types/persistence-envelope";
import { RegisterStateContainerArgs } from "../types/contracts/register-state-container";

interface Args<TState extends Object, TAction extends Action>
  extends Required<
    Pick<RegisterStateContainerArgs<TState, TAction>, "persistence">
  > {
  envelope: PersistenceEnvelope | undefined;
  initialState: (persistedState: Partial<TState>) => TState;
}

const getPayload = <TState extends Object, TAction extends Action>({
  envelope,
  persistence,
}: Pick<
  Args<TState, TAction>,
  "envelope" | "persistence"
>): Partial<TState> => {
  if (
    envelope &&
    envelope.version !== persistence.version &&
    _.isFunction(persistence.converter)
  ) {
    const converted = persistence.converter({
      persistedState: envelope.contents,
      version: envelope.version,
    });
    return converted;
  }
  return envelope?.contents || {};
};

export const invokeInitialStateFunctionForPersistence = <
  TState extends Object,
  TAction extends Action
>({
  envelope,
  initialState,
  persistence,
}: Args<TState, TAction>): TState => {
  const result = initialState(getPayload({ envelope, persistence }));
  return result;
};
