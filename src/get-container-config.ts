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

import { containerRegistered } from "./container-registered";
import { containers } from "./containers";
import { GetContainerConfig } from "./types/contracts/get-container-config";

/**
 * Returns the configuration of a registered container
 * 
 * If container is not registered:
 * - returns an empty object if `ignoreUnregistered` is true
 * - throws an error otherwise
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
    // istanbul ignore next
    throw new Error(`Container ${containerId} is unregistered`);
  }
  const container = containers[containerId].config;
  return container;
};
