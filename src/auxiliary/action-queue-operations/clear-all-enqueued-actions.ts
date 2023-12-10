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

import { containers } from "../../containers";

export const clearAllEnqueuedActions = (args: {
  /**
   * The id of the container to clear all enqueued actions for.
   * If the container cannot be found, the method will do nothing.
   */
  containerId: string;
}): void => {
  const { containerId } = args;

  const container = containers[containerId];
  if (!container) {
    return;
  }

  if (container.actionQueueContext.currentlyExecutingActionIndex === 1) {
    return;
  }

  const currentlyExecutingAction =
    container.actionQueueContext.queue[
      container.actionQueueContext.currentlyExecutingActionIndex
    ];

  /**
   * Keep in mind the action at the index 0 is the one that is currently being processed
   */
  container.actionQueueContext = {
    currentlyExecutingActionIndex: currentlyExecutingAction ? -1 : 0,
    lookup: {},
    lastActionIndex: currentlyExecutingAction ? 0 : -1,
    queue: currentlyExecutingAction ? [currentlyExecutingAction] : [],
  };
};
