import { Action } from "../types/contracts";
import { ContainerInMemory } from "../types/container-in-memory";

interface Args {
  container: ContainerInMemory<{}, Action>;
}

export const registerStateContainerErrorsAndWarnings = ({ container }: Args) => {
  if (typeof structuredClone !== "function") {
    console.warn(
      "The structuredClone function is not available - please update your browser to the newest version."
    );
  }
  if (Array.isArray(container.newState)) {
    console.error(
      "The state container's state is an array (should be object)"
    );
  }
};
