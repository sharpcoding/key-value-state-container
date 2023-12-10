import _ from "lodash";

import { Action } from "./types/contracts/action";

import { getActionPath } from "./auxiliary/get-action-path";
import { containers } from "./containers";
import { UnregisterActionDispatchedCallback } from "./types/contracts";

export const unregisterActionDispatchedCallback: UnregisterActionDispatchedCallback =
  <TAction extends Action>(args: {
    action: Pick<TAction, "name">;
    containerId: string;
    listenerId: string;
  }) => {
    const {
      containerId,
      listenerId,
      action: { name: actionName },
    } = args;
    const internalListenerId = `${getActionPath(actionName)}:${listenerId}`;
    const container = containers[containerId];

    if (_.isUndefined(container)) {
      return;
    }

    const path = getActionPath(actionName);

    if (!_.isNumber(container.listenerIdToIndexReference[internalListenerId])) {
      if (container.config?.debug?.warnings) {
        console.warn(
          `Unregistering problem: listener ${internalListenerId} is not indexed`
        );
      }
      return;
    }

    if (!container.listeners[path]) {
      if (container.config?.debug?.warnings) {
        console.warn(
          `Unregistering problem: no listeners on path ${path} for ${internalListenerId}`
        );
      }
      return;
    }

    container.listeners[path][
      container.listenerIdToIndexReference[internalListenerId]
    ] = undefined;

    if (container.config?.debug?.registration?.listeners?.unregistering) {
      console.log(
        `Unregistered listener ${internalListenerId} for path ${path}`
      );
      if (container.config?.debug?.registration?.listeners?.callstack) {
        console.trace("unregisterActionDispatchedCallback()");
      }
    }
  };
