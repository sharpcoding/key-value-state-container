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

import { ContainerInMemory } from "./types/container-in-memory";
import { getActionPath } from "./auxiliary/get-action-path";
import { containers } from "./containers";
import {
  Action,
  RegisterActionDispatchedCallbackArgs,
} from "./types/contracts";

interface Args {
  containerId: string;
  container: ContainerInMemory<Object, Action>;
  internalListenerId: string;
  log: "container-not-found" | "registered-listener-for-path";
  statePath?: string;
}

export const registerStateChangedCallbackLogging = ({
  containerId,
  container,
  log,
  internalListenerId,
  statePath,
}: Args) => {
  switch (log) {
    case "container-not-found": {
      if (container.config?.debug?.warnings) {
        console.trace(
          `Registration problem: container ${containerId} not found`,
          containers
        );
      }
      break;
    }
    case "registered-listener-for-path": {
      if (container.config?.debug?.registration?.listeners?.registering) {
        console.log(
          `Registered listener ${internalListenerId} for path ${String(
            statePath
          )}`
        );
        if (container.config?.debug?.registration?.listeners?.callstack) {
          console.trace("registerStateChangedCallback()");
        }
      }
    }
  }
};
