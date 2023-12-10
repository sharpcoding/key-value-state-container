import { containers } from "./containers";
import { getActionPath } from "./auxiliary/get-action-path";
import { RegisterActionDispatchedCallbackFunction } from "./types/contracts";
import { registerActionDispatchedCallbackLogging } from "./register-action-dispatched-callback-logging";
import { registerListenerInternal } from "./register-listener-internal";

/**
 * Low-level function registering a callback that will get called when an action
 * got dispatched.
 *
 * No matter the state was changed or not, a was reducer invoked or not
 * (see also `bypassReducer` in the `dispatchAction()` function),
 * this callback will get called.
 */
export const registerActionDispatchedCallback: RegisterActionDispatchedCallbackFunction =
  ({ action: { name: actionName }, callback, listenerId, containerId }) => {
    const internalListenerId = `${getActionPath(actionName)}:${listenerId}`;
    const container = containers[containerId];
    if (!container) {
      registerActionDispatchedCallbackLogging({
        container,
        internalListenerId,
        log: "container-not-found",
      });
      throw new Error("Container not found");
    }
    const actionPath = getActionPath(actionName);

    registerListenerInternal({
      callback,
      container,
      internalListenerId,
      path: actionPath,
    });

    registerActionDispatchedCallbackLogging({
      actionPath,
      container,
      internalListenerId,
      log: "registered-listener-for-path",
    });
  };
