import _ from "lodash";

import { containers } from "./containers";
import { UnregisterStateContainer } from "./types/contracts/unregister-state-container";

export const unregisterStateContainer: UnregisterStateContainer = (args: {
  containerId: string;
}) => {
  const { containerId } = args;
  if (!containers[containerId]) {
    return;
  }
  const { lastActionIndex } = containers[containerId].actionQueueContext;
  if (lastActionIndex >= 0) {
    console.log(
      `Failed to unregister container with id ${containerId}, as it has ${
        lastActionIndex + 1
      } the following actions enqueued`
    );
    return;
  }

  const debug = containers[containerId].config?.debug;
  delete containers[containerId];

  if (debug?.registration?.container?.registering) {
    console.log(`Container with id ${containerId} unregistered`);
    if (debug?.registration?.container?.callstack) {
      console.trace("unregisterStateContainer()");
    }
  }
};
