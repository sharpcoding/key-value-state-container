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

import _ from "lodash";

import { containers } from "./containers";
import { UnregisterStateContainer } from "./types/contracts/unregister-state-container";

/**
 * Unregisters a state container from memory.
 * 
 * Each `registerStateContainer()` call should be paired 
 * with `unregisterStateContainer()` invocation.
 */
export const unregisterStateContainer: UnregisterStateContainer = (args: {
  containerId: string;
}) => {
  const { containerId } = args;
  if (!containers[containerId]) {
    return;
  }
  const { lastActionIndex } = containers[containerId].actionQueueContext;
  if (lastActionIndex >= 0) {
    console.log(containers[containerId].actionQueueContext);
    console.log(
      `Failed to unregister container with id ${containerId}, as it has ${
        lastActionIndex + 1
      } actions enqueued`
    );
    return;
  }

  const debug = containers[containerId].config?.debug;
  delete containers[containerId];

  if (debug?.registration?.container?.registering) {
    console.log(`Container with id ${containerId} unregistered`);
    if (debug?.registration?.container?.callstack) {
      console.trace("unregisterStateContainer()");
    }
  }
};
