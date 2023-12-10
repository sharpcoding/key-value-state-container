import { Action } from "./action";

/**
 * Contract for set of arguments that are passed back from state container 
 * to the _callback function_ when action got dispatched and/or reducer executed 
 * (state changed).
 */
export interface ClientNotificationCallbackArgs<
  TState extends Object,
  TAction extends Action
> {
  action: TAction;
  /**
   * List of state **attributes** that got changed.
   * This name is, however, reserved for future extensions.
   * 
   * Please note state container only detects changes made to the top-level attributes.
   * And, which is important, you need to create (return in the reducer function) 
   * a new state object (sorry, no `immer.js`-like magic here, at least for now).
   * 
   * Let's take as an example simple state of an electric vehicle:
   * 
   * ```
   * Object ("EV")
   * +- "power" (object)
   * |  +- "currentConsumption" (number)
   * |  +- "rangeLeft" (number)
   * +- "wheels" (array)
   *    +- "frontLeftPressure" (number)
   *    +- "frontRightPressure" (number)
   *    +- "backLeftPressure" (number)
   *    +- "backRightPressure" (number)
   * ```
   * 
   * If there is a state change due to invoking `accelerateReducer()` function,
   * that, in effect, modifies changes both the `currentConsumption` (in kWh) and `rangeLeft` attributes,
   * the attributes that got changed would be `["power"]` (not `["power.currentConsumption", "power.rangeLeft"]`).
   * 
   * Please note:  `[]` got returned when action made no effect to the state 
   * or the `bypassReducer` was `true`
   */
  changedPaths: (keyof TState)[];
  newState: TState;
  oldState: TState;
}
