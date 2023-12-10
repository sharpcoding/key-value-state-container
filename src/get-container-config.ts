import { Config } from "./types/config";
import { containerRegistered } from "./container-registered";
import { containers } from "./containers";
import { GetContainerConfig } from "./types/contracts/get-container-config";

/**
 * Contrary to `getContainer()`, function, that gets the 
 * current state of the container, this function returns the
 * configuration.
 */
export const getContainerConfig: GetContainerConfig = (args) => {
  const { containerId, ignoreUnregistered } = args;
  if (
    !containerRegistered({
      containerId,
    })
  ) {
    if (ignoreUnregistered) {
      return {};
    }
    throw new Error(`Container ${containerId} is unregistered`);
  }
  const container = containers[containerId].config;
  return container;
};
