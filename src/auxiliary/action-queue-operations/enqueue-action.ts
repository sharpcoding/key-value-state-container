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

import { ContainerInMemory } from "../../types/container-in-memory";
import { containers } from "../../containers";
import { Action } from "../../types/contracts/action";
import { actionInQueueStatus } from "./action-in-queue-status";
import { ACTION_QUEUE_DEFAULT_SIZE } from "../../consts";

interface Args<TAction> {
  containerId: string;
  action: TAction;
}

const notify = <TAction extends Action>(
  container: ContainerInMemory<any, TAction>,
  action: TAction,
  operation: "added to" | "replaced in"
) => {
  if (
    container?.config?.debug?.dispatching?.active &&
    container?.config?.debug?.dispatching?.queue
  ) {
    if (
      container?.config?.debug?.nonTrackedActions &&
      container.config.debug.nonTrackedActions[action.name]
    ) {
      return;
    }
    console.log(
      `Action ${action.name} ${operation} queue:`,
      _.clone(
        container.actionQueueContext.queue.slice(
          0,
          container.actionQueueContext.lastActionIndex + 1
        )
      )
    );
  }
};

const addActionToQueue = <TAction extends Action>(
  container: ContainerInMemory<any, TAction>,
  action: TAction
) => {
  if (
    container.actionQueueContext.lastActionIndex + 1 >
    (container.config?.actionQueueMaxLength || ACTION_QUEUE_DEFAULT_SIZE)
  ) {
    throw new Error(
      `Action queue buffer overrun (increase ACTION_QUEUE_DEFAULT_SIZE (${ACTION_QUEUE_DEFAULT_SIZE}) in config settings)`
    );
  }
  container.actionQueueContext.lastActionIndex += 1;
  container.actionQueueContext.queue[
    container.actionQueueContext.lastActionIndex
  ] = action;
  container.actionQueueContext.lookup[action.name] =
    container.actionQueueContext.lastActionIndex;

  if (action.bypassReducer) {
    container.bypassReducerActionEnqueued = true;
  }

  notify<TAction>(container, action, "added to");
};

const replaceActionInQueue = <TAction extends Action>(
  container: ContainerInMemory<any, TAction>,
  action: TAction,
  index: number
) => {
  container.actionQueueContext.queue[index] = action;
  notify<TAction>(container, action, "replaced in");
};

export const enqueueAction = <TAction extends Action>(args: Args<TAction>) => {
  const { action, containerId } = args;

  const container = containers[containerId];
  if (!container) {
    console.warn(
      `Cannot enqueue action ${action.name} - container ${containerId} not found !`,
      {
        containers,
      }
    );
    return;
  }

  const result = actionInQueueStatus({
    containerId,
    name: action.name,
  });

  switch (result.status) {
    case "no-container": {
      break;
    }
    case "empty-queue":
    /**
     * Although there is currently set for execution exactly action of the same name
     */
    case "currently-executing":
    /**
     * Not in queue: add action!
     */
    case "not-in-queue": {
      addActionToQueue(container, action);
      break;
    }
    case "enqueued-for-later-execution": {
      if (action.evanescent) {
        replaceActionInQueue(container, action, result.index);
      } else {
        addActionToQueue(container, action);
      }
      break;
    }
  }
};
