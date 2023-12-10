import { Action } from "./action";

/**
 * Contract for a reducer function.
 * 
 * Put simply, reducer is a function that takes a state (object) and an action (object) 
 * and returns a state (object). In 99.9% of cases, it is a **new** object.
 * 
 * The caveats:
 * - the result state doesn't have to be a new object: 
 *   it is completely legal to return the very same object
 * - moreover, for performance (or any) reasons you **can** modify existing state object 
 *   (no dogmas here and the state container won't punish you for that),
 * - but... if your want to invoke the listeners (callbacks), you have to return a new object
 *   make the state change detected (at least in the current implementation)
 *   and support the reasoning in the debug section
 * 
 * The biggest difference between this and the `redux` 
 * reducer is that this reducer is `async`.
 * 
 * The functions returns the state - or at least "promises" to do so.
 * 
 * Another important thing to the positive scenario is supported (no `catch`).
 * Error handling should be done in the reducer function. 
 * 
 * @remarks
 * You don't have to call any promise in your reducer, example code:
 * 
 * ```
 * export const addReducer: Reducer<State, AddAction> = async ({ state, action }) => {
 *   return {
 *     ...state,
 *     count: state.count + action.payload
 *   };
 * }
 * 
 * export const multiplyReducer: Reducer<State, AddAction> = async ({ state, action }) => {
 *   return {
 *     ...state,
 *     count: state.count * action.payload
 *   };
 * }
 * ```
 * 
 * If 
 * ```
 * type AddAction = { name: "add", payload: number };
 * type MultiplyAction = { name: "multiply", payload: number };
 * ```
 * are your only actions, then you can define a "root" reducer like this:
 * 
 * ```ts
 * export const reducer = (args: { state: State; action: Action }) => {
 *   switch (action.name) {
 *     case "add":
 *       return addReducer(args);
 *     case "multiply":
 *       return multiplyReducer(args);
 *     // this is optional, but recommended...
 *     default:
 *       return state;
 *   }
 * }
 * ```
 * 
 * Plug-in this reducer when calling `registerStateContainer` function.
 */
export interface Reducer<
  TState extends Object,
  TAction extends Action
> {
  (args: { state: TState; action: TAction }): Promise<TState>;
}
