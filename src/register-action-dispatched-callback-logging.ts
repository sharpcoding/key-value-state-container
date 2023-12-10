import { Memory } from "./types/memory";
import { getActionPath } from "./auxiliary/get-action-path";
import { containers } from "./containers";
import {
  Action,
  RegisterActionDispatchedCallbackArgs,
} from "./types/contracts";

interface Args {
  actionPath?: string;
  container: Memory<Object, Action>;
  internalListenerId: string;
  log: "container-not-found" | "registered-listener-for-path";
}

export const registerActionDispatchedCallbackLogging = ({
  actionPath,
  container,
  log,
  internalListenerId,
}: Args) => {
  switch (log) {
    case "container-not-found": {
      if (container.config?.debug?.warnings) {
        console.trace(
          `Registration problem: container ${container.id} not found`,
          containers
        );
      }
      break;
    }
    case "registered-listener-for-path": {
      if (container.config?.debug?.registration?.listeners?.registering) {
        console.log(
          `Registered listener ${internalListenerId} for path ${actionPath}`
        );
        if (container.config?.debug?.registration?.listeners?.callstack) {
          console.trace("registerActionDispatchedCallback()");
        }
      }
      break;
    }
  }
};
