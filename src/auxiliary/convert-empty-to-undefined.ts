import _ from "lodash";

/**
 * Converts empty object to `undefined`.
 * This is a workaround for getting an empty object from unregistered state container.
 * This way it allows to use `||` operator to get the default value.
 */
export const convertEmptyToUndefined = <TState extends Object>(
  state: TState
) => {
  if (_.isEmpty(state)) {
    return undefined;
  }
  return state;
};
