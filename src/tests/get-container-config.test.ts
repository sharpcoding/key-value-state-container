import { containers } from "../containers";
import { getContainerConfig } from "../get-container-config";

const containerId = "test-container-for-get-container-config";

test("getContainerConfig gets properly registered container config", async () => {
  containers[containerId] = {
    actionQueueContext: {
      lookup: {},
      queue: [],
      currentlyExecutingActionIndex: -1,
      lastActionIndex: -1,
    },
    changedPaths: [],
    config: {
      actionQueueMaxLength: 15000,
      keepState: true,
      protectState: true,
    },
    lateInvokeChangedPaths: [],
    id: containerId,
    listeners: {},
    listenerIdToIndexReference: {},
    listenerIndexToIdReference: {},
    newState: {},
    oldState: {},
  };

  const config = getContainerConfig({
    containerId,
  });

  expect(config).toEqual({
    actionQueueMaxLength: 15000,
    keepState: true,
    protectState: true,
  });

  delete containers[containerId];
});

test("getContainerConfig throws an error for unregistered config", async () => {
  try {
    getContainerConfig({
      containerId,
      ignoreUnregistered: true,
    });
  } catch (e) {
    expect(e).toBeDefined();
  }
});

test("getContainerConfig gets unregistered empty container config with ignoreUnregistered flag", async () => {
  const config = getContainerConfig({
    containerId,
    ignoreUnregistered: true,
  });

  expect(config).toEqual({});
});
