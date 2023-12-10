import { Action } from "./contracts/action";

type QueueElement<TAction extends Action> = TAction | undefined;

type ActionName = string;
/**
 * Returns the first possible index of the action in the queue
 */
type ActionInQueueFirstIndex = number;

/**
 * @ignore
 */
export interface ActionQueueContext<TAction extends Action> {
  lookup: Record<ActionName, ActionInQueueFirstIndex>;
  queue: QueueElement<TAction>[];
  /**
   * Index of the currently executed action in queue.
   * Never can be bigger than `lastActionIndex`.
   * 
   * `-1` means no action in the queue!
   */
  currentlyExecutingActionIndex: number;
  /**
   * Index of the last action (of any "name") that is in the queue,
   * The bigger the index, the more recently action was added 
   * to the the queue.
   * 
   * `-1` means "empty queue"
   */
  lastActionIndex: number;
}