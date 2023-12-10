import _ from "lodash";

import { containers } from "../../containers";

interface Args {
  containerId: string;
  query: "count-all-actions" | "count-only-bypass-reducer-actions";
}

export const numberOfActionsLeft = (args: Args): number => {
  const { containerId, query } = args;

  const container = containers[containerId];
  if (!container) {
    return 0;
  }
  let result = 0;
  for (
    let i = container.actionQueueContext.currentlyExecutingActionIndex + 1;
    i <= container.actionQueueContext.lastActionIndex;
    i++
  ) {
    const action = container.actionQueueContext.queue[i];
    switch (query) {
      case "count-all-actions": {
        result++;
        break;
      }
      case "count-only-bypass-reducer-actions": {
        if (action && action.bypassReducer) {
          result++;
        }
        break;
      }
    }
  }
  return result;
};
