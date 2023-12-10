import { containers } from "../../containers";

interface Args {
  containerId: string;
}

/**
 * Little helper function useful in running tests.
 * Resolves when the action queue is empty (finished processing last action)
 */
export const finishedProcessingQueue = async ({containerId }: Args) => {
  return new Promise(async (resolve) => {
    let run = true;
    do {
      const container = await containers[containerId];
      if (container.actionQueueContext.currentlyExecutingActionIndex === -1) {
        run = false;
      }
    } while (run);
    resolve(true);
  });
};
