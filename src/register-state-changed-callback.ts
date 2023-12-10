import _ from "lodash";
import { LATE_INVOKE_PREFIX } from "./consts";
import { containers } from "./containers";
import { Action } from "./types/contracts/action";
import {
  ClientNotificationCallbackArgs,
  RegisterStateChangedCallback,
} from "./types/contracts";
import { TKnownStatePath } from "./types/contracts/known-state-path";
import { registerStateChangedCallbackLogging } from "./register-state-changed-callback-logging";
import { registerListenerInternal } from "./register-listener-internal";

export const registerStateChangedCallback: RegisterStateChangedCallback = <
  TState extends Object,
  TAction extends Action
>(args: {
  callback: (args: ClientNotificationCallbackArgs<TState, TAction>) => void;
  containerId: string;
  lateInvoke?: boolean;
  listenerId: string;
  statePath: TKnownStatePath<TState>;
}) => {
  const {
    callback,
    lateInvoke,
    listenerId,
    containerId,
    statePath: paramsStatePath,
  } = args;
  const statePath = lateInvoke
    ? `${LATE_INVOKE_PREFIX}:${String(paramsStatePath)}`
    : String(paramsStatePath);
  const internalListenerId = `${String(statePath)}:${listenerId}`;
  const container = containers[containerId];

  if (_.isUndefined(container)) {
    registerStateChangedCallbackLogging({
      containerId,
      container,
      internalListenerId,
      log: "container-not-found",
    });
    throw new Error("Container not found");
  }

  registerListenerInternal({
    callback,
    container,
    internalListenerId,
    path: statePath,
  });

  registerStateChangedCallbackLogging({
    containerId,
    container,
    internalListenerId,
    log: "registered-listener-for-path",
    statePath,
  });
};
