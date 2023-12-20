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

import { Action } from "../types/contracts/action";
import {
  getNextAction,
  markActionGetsExecuted,
  normalizeActionQueue,
} from "../auxiliary/action-queue-operations";
import { applyAutoActions } from "./apply-auto-actions";
import { applyPersistence } from "./apply-persistence";
import { containers } from "../containers";
import { executeAction } from "./execute-action";

export const actionNextSteps = <TAction extends Action>({
  action,
  containerId,
}: {
  containerId: string;
  action: TAction;
}) => {
  applyAutoActions({
    action,
    containerId,
  });

  const container = containers[containerId];

  if (container && container.persistence) {
    applyPersistence({
      containerId,
    });
  }

  const nextAction = getNextAction({
    containerId,
  });

  if (nextAction) {
    markActionGetsExecuted({ containerId });
    executeAction({
      containerId,
      action: nextAction,
    });
  } else {
    normalizeActionQueue({
      containerId,
    });
  }
};
