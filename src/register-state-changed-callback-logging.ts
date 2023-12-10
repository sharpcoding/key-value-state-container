import { Memory } from "./types/memory";
import { getActionPath } from "./auxiliary/get-action-path";
import { containers } from "./containers";
import {
  Action,
  RegisterActionDispatchedCallbackArgs,
} from "./types/contracts";

interface Args {
  containerId: string;
  container: Memory<Object, Action>;
  internalListenerId: string;
  log: "container-not-found" | "registered-listener-for-path";
  statePath?: string;
}

export const registerStateChangedCallbackLogging = ({
  containerId,
  container,
  log,
  internalListenerId,
  statePath,
}: Args) => {
  switch (log) {
    case "container-not-found": {
      if (container.config?.debug?.warnings) {
        console.trace(
          `Registration problem: container ${containerId} not found`,
          containers
        );
      }
      break;
    }
    case "registered-listener-for-path": {
      if (container.config?.debug?.registration?.listeners?.registering) {
        console.log(
          `Registered listener ${internalListenerId} for path ${String(
            statePath
          )}`
        );
        if (container.config?.debug?.registration?.listeners?.callstack) {
          console.trace("registerStateChangedCallback()");
        }
      }
    }
  }
};
