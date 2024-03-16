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
