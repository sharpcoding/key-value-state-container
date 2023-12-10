import _ from "lodash";
import { containers } from "./containers";
import { UnregisterStateChangedCallback } from "./types/contracts/unregister-state-changed-callback";
import { TKnownStatePath } from "./types/contracts/known-state-path";

export const unregisterStateChangedCallback: UnregisterStateChangedCallback = <
  TState extends Object
>(args: {
  containerId: string;
  statePath: TKnownStatePath<TState>;
  listenerId: string;
}) => {
  const { containerId, listenerId, statePath } = args;
  const internalListenerId = `${String(statePath)}:${listenerId}`;
  const container = containers[containerId];

  if (_.isUndefined(container)) {
    return;
  }

  if (_.isUndefined(container.listeners[statePath as string])) {
    return;
  }

  if (!_.isNumber(container.listenerIdToIndexReference[internalListenerId])) {
    if (container.config?.debug?.warnings) {
      console.warn(
        `Unregistering problem: listener ${internalListenerId} is not indexed`
      );
    }
    return;
  }

  container.listeners[statePath as string][
    container.listenerIdToIndexReference[internalListenerId]
  ] = undefined;

  if (container.config?.debug?.registration?.listeners?.unregistering) {
    console.log(
      `Unregistered listener ${internalListenerId} for path ${String(statePath)}`
    );
    if (container.config?.debug?.registration?.listeners?.callstack) {
      console.trace("unregisterStateChangedCallback()");
    }
  }
};
