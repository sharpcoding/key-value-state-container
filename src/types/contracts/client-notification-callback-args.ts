/**
 * The MIT License (MIT)
 * 
 * Copyright Tomasz Szatkowski and WealthArc https://www.wealtharc.com (c) 2023 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
