import { containers } from "./containers";

/**
 * Returns `true` the container got registered,
 * otherwise returns `false`.
 */
export const containerRegistered = (args: {
  /**
   * The id of the container to check.
   */
  containerId: string;
}): boolean => {
  const { containerId } = args;
  const container = containers[containerId];
  return !!container;
};
