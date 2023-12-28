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
import { ContainerInMemory } from "../../types/container-in-memory";

interface Args {
  container: ContainerInMemory<Object, Action>;
}

type Result = {
  all: number;
  bypassReducer: number;
};

export const numberOfActionsLeft = (args: Args): Result => {
  const { container } = args;

  if (!container) {
    return {
      all: 0,
      bypassReducer: 0,
    };
  }

  let all = 0;
  let bypassReducer = 0;

  for (
    let i = container.actionQueueContext.currentlyExecutingActionIndex + 1;
    i <= container.actionQueueContext.lastActionIndex;
    i++
  ) {
    const action = container.actionQueueContext.queue[i];
    all++;
    if (action && action.bypassReducer) {
      bypassReducer++;
    }
  }
  return {
    all,
    bypassReducer,
  };
};
