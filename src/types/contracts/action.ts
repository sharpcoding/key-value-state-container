/**
 * Contract for the state container action (how action should look like).
 * 
 * This might might look a little bit complex at first, but here are some examples of 
 * action contracts:
 * 
 * ```
 * type IncreaseCounterAction = {
 *   name: "increase-counter";
 *   payload: number;
 * }
 * 
 * type DecreaseCounterAction = {
 *   name: "increase-counter";
 *   payload: number;
 * }
 * 
 * type ResetCounterAction = {
 *   name: "reset-counter";
 * }
 * ```
 * 
 * If `Action` is a contract defined as above, then the **action** is an object (described by the contract).
 * 
 * Example action objects:
 * ```
 * {
 *   name: "increase-counter",
 *   payload: 1 
 * }
 * ```
 * ```
 * {
 *   name: "reset-counter",
 * }
 * ```
 * 
 * Notes:
 * - `name` attribute is required, however, there is a (planned) possibility to use `type` 
 *    attribute instead of `name` (to be more `redux` compliant)
 * -  usually actions that pass some information can be placed in the `payload` attribute 
 *    (however, it is not required).
 */
export interface Action {
  /**
   * Each action should have an unique `name` attribute
   */
  name: string;
  /**
   * If set to `true`, dispatching an action an won't change the
   * state - reducer section in code would get called.
   *
   * This mechanism can be used for performance optimization.
   */
  bypassReducer?: boolean;

  /**
   * This flag affects managedAttributes.asyncOperationFlag attribute
   * (state-container configuration)
   *
   * Sending action with `async: true` sets the in-state attribute
   * automatically to `true` automatically as the reducer starts executing,
   * and automatically to `false` - as the reducer ends executing.
   */
  async?: boolean;

  /**
   * If set to `true`, the action will allow the main thread fully repaint
   * user interface instead of taking the next action from the queue
   * and executing it (if there is any).
   *
   * Usually (in 99% cases) you don't need to use this flag,
   * but there are some scenarios where a full UI repaint is required.
   *
   * One of such cases are actions like "long-operation-started",
   * displaying a spinner indicating application is busy
   * and might not be able to respond to user input.
   */
  waitForFullUiRepaint?: boolean;

  /**
   * This flag switches on an advanced scenario of action handling
   * in the action queue.
   *
   * By saying "evanescent" we refer more to the meaning of the payload,
   * than action. The perfect candidate for "evanescent" action meeting
   * the following criteria:
   * - only the "latest" information stored in the payload matter
   * - there is no problem with "forgetting" or discarded any previous actions
   *   (dispatched under the same action name)
   * - there is no need to keep duplicate(s) of the action
   *
   * A good example of such action is a theoretical "mouse-moved" action
   *
   * The "current" mouse cursor changes constantly and only
   * the latest possible coordinates matter - there is no reason
   * to keep information like this in the action message queue
   */
  evanescent?: boolean;
}
