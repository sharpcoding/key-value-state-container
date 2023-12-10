import _ from "lodash";
import { TKnownStatePath } from "./types/contracts/known-state-path";
import { unregisterStateChangedCallback } from "./unregister-state-changed-callback";

export const unregisterStateChangedMultipleCallbacks = <
  TState extends Object 
>(args: {
  containerId: string;
  statePaths: TKnownStatePath<TState>[];
  listenerId: string;
}) => {
  const { containerId, listenerId, statePaths } = args;
  _.each(statePaths, (el: TKnownStatePath<TState>) => {
    unregisterStateChangedCallback<TState>({
      containerId,
      listenerId,
      statePath: el,
    });
  });
};
