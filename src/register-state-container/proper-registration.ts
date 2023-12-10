import _ from "lodash";

import { Action } from "../types/contracts/action";
import { containers } from "../containers";
import { ACTION_QUEUE_DEFAULT_SIZE } from "../consts";
import {
  AutoActions,
  Reducer,
  RegisterStateContainerArgs,
} from "../types/contracts";

interface Args<TState extends Object, TAction extends Action>
  extends RegisterStateContainerArgs<TState, TAction> {
  initialState: TState;
}

export const properRegistration = <
  TState extends Object,
  TAction extends Action
>({
  autoActions,
  containerId,
  config,
  initialState,
  reducer,
  persistence,
}: Args<TState, TAction>) => {
  const oldState = _.clone(initialState);
  const newState = _.clone(initialState);
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

  if (config?.debug?.registration?.container?.registering) {
    console.log(`Container with id ${containerId} registered`);
    if (config?.debug?.registration?.container?.callstack) {
      console.trace("registerStateContainer()");
    }
  }
};
