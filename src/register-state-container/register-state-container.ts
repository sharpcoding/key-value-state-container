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
import { containers } from "../containers";
import {
  RegisterStateContainer,
  RegisterStateContainerArgs,
} from "../types/contracts/register-state-container";
import { getPersistenceKey } from "../auxiliary/get-persistence-key";
import { invokeInitialStateFunctionForPersistence } from "./invoke-initial-state-function-for-persistence";
import { properRegistration } from "./proper-registration";
import { configDefaults } from "../types/config/defaults";

export const registerStateContainer: RegisterStateContainer = <
  TState extends Object,
  TAction extends Action
>({
  autoActions,
  config: argsConfig,
  containerId,
  initialState,
  reducer,
  persistence,
}: RegisterStateContainerArgs<TState, TAction>) => {
  const config = { ...configDefaults, ...argsConfig };
  if (_.isObject(containers[containerId])) {
    if (config?.keepState) {
      return;
    }
  }

  if (_.isFunction(initialState)) {
    if (!persistence) {
      throw new Error(
        `You must provide persistence configuration for container ${containerId} if you want to use initialState function`
      );
    }
    const { getEnvelope } = persistence;
    const envelope = getEnvelope(
      persistence.getKey
        ? persistence.getKey({ containerId, prefix: persistence?.prefix })
        : getPersistenceKey({
            prefix: persistence?.prefix,
            containerId,
          })
    );
    properRegistration({
      autoActions,
      config,
      containerId,
      initialState: invokeInitialStateFunctionForPersistence({
        envelope,
        initialState,
        persistence,
      }),
      persistence,
      reducer,
    });
    return;
  }

  properRegistration({
    autoActions,
    config,
    containerId,
    initialState,
    persistence,
    reducer,
  });
};
