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

import { ACTION_QUEUE_DEFAULT_SIZE } from "../../consts";
import { containers } from "../../containers";
import { Action } from "../../types/contracts/action";

interface Args {
  containerId: string;
}

/**
 * If all actions got executed from the action queue,
 * sets indices of the action queue to -1,
 * to avoid the action queue "buffer overrun".
 */
export const normalizeActionQueue = <TAction extends Action>(
  args: Args
): TAction | undefined => {
  const { containerId } = args;

  const container = containers[containerId];
  if (!container) {
    return;
  }

  if (
    container.actionQueueContext.currentlyExecutingActionIndex !==
    container.actionQueueContext.lastActionIndex
  ) {
    throw new Error(
      "state-container: trying to normalize action queue while there are actions in queue!"
    );
  }

  const config = container.config;

  container.bypassReducerActionEnqueued = false;
  container.lateInvokeChangedPaths = [];

  container.actionQueueContext = {
    currentlyExecutingActionIndex: -1,
    lastActionIndex: -1,
    lookup: {},
    queue: Array.from(
      { length: config?.actionQueueMaxLength || ACTION_QUEUE_DEFAULT_SIZE },
      () => undefined
    ),
  };
};
