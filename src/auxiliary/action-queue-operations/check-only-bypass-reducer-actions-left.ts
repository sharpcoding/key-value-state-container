import { Memory } from "../../types/memory";
import { Action } from "../../types/contracts/action";
import { numberOfActionsLeft } from "./number-of-actions-left";

type Args = {
  container: Memory<Object, Action>;
};

/**
 * Performance optimization related to handling `bypassReducer` actions.
 */

export const checkOnlyBypassReducerActionsLeft = ({ container }: Args) => {
  if (!container.bypassReducerActionEnqueued) {
    return;
  }
  const { all, bypassReducer } = numberOfActionsLeft({ container });
  return all === bypassReducer;
};
