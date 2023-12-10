import _ from "lodash";

import { Action } from "./types/contracts/action";
import { CallbacksDictionary } from "./types/callbacks-dictionary";
import { registerStateChangedCallback } from "./register-state-changed-callback";
import { TKnownStatePath } from "./types/contracts";

export const registerStateChangedMultipleCallbacks = <
  TState extends Object,
  TAction extends Action
>(args: {
  callbacks: CallbacksDictionary<TState, TAction>;
  containerId: string;
  listenerId: string;
}) => {
  const { containerId, listenerId, callbacks } = args;
  _.each(_.keys(callbacks) as string[], (statePath: string) => {
    const callback = callbacks[statePath];
    if (!callback) {
      return;
    }
    registerStateChangedCallback<TState, TAction>({
      callback,
      containerId,
      listenerId,
      statePath: statePath as TKnownStatePath<TState>,
    });
  });
};
