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

import { Action } from "../../types/contracts/action";
import { containers } from "../../containers";

interface Args<TAction extends Action> extends Pick<TAction, "name"> {
  containerId: string;
}

type Result =
  | { status: "no-container" }
  | { status: "empty-queue" }
  | { status: "not-in-queue" }
  | { status: "currently-executing" }
  /**
   * This type of result indicates:
   * - action is not currently executed...
   * - ...yet, it is enqueued somewhere in the message queue
   * `index` attribute provides position of the first position of
   * the action in queue
   */
  | { status: "enqueued-for-later-execution"; index: number };

export const actionInQueueStatus = <TAction extends Action>(
  args: Args<TAction>
): Result => {
  const { name, containerId } = args;

  const container = containers[containerId];
  if (!container) {
    return { status: "no-container" };
  }

  if (
    container.actionQueueContext.currentlyExecutingActionIndex ===
    container.actionQueueContext.lastActionIndex
  ) {
    return { status: "empty-queue" };
  }

  const currentlyExecutingAction =
    container.actionQueueContext.queue[
      container.actionQueueContext.currentlyExecutingActionIndex
    ];
  if (
    currentlyExecutingAction &&
    currentlyExecutingAction.name === name
  ) {
    return { status: "currently-executing" };
  }

  const lastIndexOfAction = container.actionQueueContext.lookup[name];

  if (
    lastIndexOfAction >
    container.actionQueueContext.currentlyExecutingActionIndex
  ) {
    return {
      status: "enqueued-for-later-execution",
      index: container.actionQueueContext.lookup[name],
    };
  }

  return { status: "not-in-queue" };
};
