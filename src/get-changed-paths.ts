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

interface Args {
  oldState: any;
  comparison: "shallow" | "deep";
  newState: any;
}

const getChangedPathsInternal = (
  args: Args & {
    parentPath: string[];
  }
): string[] => {
  const { comparison, newState,  oldState, parentPath } = args;
  return _.reduce(
    _.uniq([..._.keys(oldState), ..._.keys(newState)]),
    (acc: string[], key) => {
      switch (comparison) {
        case "deep": {
          if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
            acc.push(_.join([...parentPath, key], "."));
          }
          break;
        }
        case "shallow": {
          if (oldState[key] !== newState[key]) {
            acc.push(_.join([...parentPath, key], "."));
          }
          break;
        }
      }
      return acc;
    },
    []
  );
};

export const getChangedPaths = (args: Args) => {
  return getChangedPathsInternal({ ...args, parentPath: [] });
};
