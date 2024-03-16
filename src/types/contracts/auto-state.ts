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
 * Optional state "factory" function that "auto-generates" state.
 *
 * The "auto" phrase means the `autoState` function invocation is automatic:
 * - after an action gets dispatched
 * - after the new state is calculated in reducer and passed to this function in `newState` argument
 * - ...but before:
 *   - invoking any callback listeners
 *   - dispatching any new actions (taking an action from a queue and dispatching it)
 *
 * In most cases the `newState` parameter is not useful and `autoState` recalculation 
 * function looks for the more useful `changedPaths` attribute.
 *
 * Key points:
 * - the attribute(s) that are calculated in `autoState` should be somehow 
 *   related to the changed attributes
 * - good examples of such state attributes are lookup tables, caches etc.
 * - `autoState` must be synchronous (so no possibility to call e.g. REST API)
 *
 * Example: provided there is a state like this
 *
 * ```
 * type CarValuationContext = {
 *   // car brand
 *   brand: string;
 *   model: string;
 *   // production date yyyy-MM-dd
 *   production: string;
 *
 *   chassis: "new" | "used" | "damaged";
 *   body: "new" | "used" | "damaged";
 *
 *   // total mileage
 *   mileage: number;
 *
 *   // valuation
 *   valuationUSD: number;
 * };
 *
 * type State = CarValuationContext;
 * ```
 *
 * the `brand`, `model`, `production` are constants (as these never change), 
 * but the `valuationUSD` of the car is related to `chassis`, `body` 
 * and `mileage` attributes.
 * 
 * The key point is: there is no direct `"decrease-valuation"` action!
 * .
 * The `valuationUSD` is the consequence of calling one of the following:
 * - `"damage-to-chassis"`
 * - `"damage-to-body"`
 * - `"add-miles"`
 * actions (and then appropriate reducers).
 *
 * Moreover, `"damage-to-chassis"`, `"damage-to-body"`, `"add-miles"` actions don't
 * require dispatching special `"recalculate-valuation"` action (although it could 
 * be done this way).
 *
 * Please note: this is an experimental feature and could change in the future.
 */
export interface AutoState<TState extends Object, TAction extends Action> {
  (args: {
    action: TAction;
    changedPaths: (keyof TState)[];
    newState: TState;
    oldState: TState;
  }): TState;
}
