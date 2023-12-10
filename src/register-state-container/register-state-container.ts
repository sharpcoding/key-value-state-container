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

export const registerStateContainer: RegisterStateContainer = <
  TState extends Object,
  TAction extends Action
>({
  autoActions,
  config,
  containerId,
  initialState,
  reducer,
  persistence,
}: RegisterStateContainerArgs<TState, TAction>) => {
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
