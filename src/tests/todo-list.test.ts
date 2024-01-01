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

import {
  registerStateContainer,
  dispatchAction,
  finishedProcessingQueue,
  getContainer,
  unregisterStateContainer,
} from "../index";

import {
  Action,
  autoActions,
  buildInitialState,
  getNewTaskId,
  reducer,
  State,
  Task,
} from "./common/todo-logic";

const containerId = "todo-list";

beforeAll(() => {
  registerStateContainer<State, Action>({
    autoActions,
    containerId,
    initialState: buildInitialState(),
    reducer,
  });
});

afterAll(() => {
  unregisterStateContainer({ containerId });
});

test("verify initial state in properly initialized", () => {
  const { workingTasks } = getContainer<State>({ containerId });
  expect(workingTasks).toEqual([
    {
      emoji: "🍎",
      id: "2",
      name: "Buy apples",
      status: "in-progress",
    },
    {
      emoji: "🍌",
      id: "3",
      name: "Buy bananas",
      status: "todo",
    },
    {
      emoji: "🍊",
      id: "4",
      name: "Buy oranges",
      status: "todo",
    },
  ]);
});

test("add buy milk task", async () => {
  const newTask: Task = {
    emoji: "🥛",
    id: getNewTaskId(getContainer<State>({ containerId })),
    name: "Buy milk",
    status: "todo",
  };
  dispatchAction<State, Action>({
    containerId,
    action: {
      name: "add-task",
      payload: newTask,
    },
  });
  await finishedProcessingQueue({ containerId });
  expect(getContainer<State>({ containerId }).workingTasks).toEqual([
    { emoji: "🍌", id: "3", name: "Buy bananas", status: "todo" },
    {
      emoji: "🥛",
      id: "5",
      name: "Buy milk",
      status: "todo",
    },
    {
      emoji: "🍊",
      id: "4",
      name: "Buy oranges",
      status: "todo",
    },
    {
      emoji: "🍎",
      id: "2",
      name: "Buy apples",
      status: "in-progress",
    },
  ]);
});

test("filter by task name", async () => {
  dispatchAction<State, Action>({
    containerId,
    action: {
      name: "set-filter",
      payload: {
        taskName: "es",
      },
    },
  });
  await finishedProcessingQueue({ containerId });
  expect(getContainer<State>({ containerId }).workingTasks).toEqual([
    {
      emoji: "🍊",
      id: "4",
      name: "Buy oranges",
      status: "todo",
    },
    {
      emoji: "🍎",
      id: "2",
      name: "Buy apples",
      status: "in-progress",
    },
  ]);
});

test("filter by task status", async () => {
  dispatchAction<State, Action>({
    containerId,
    action: {
      name: "set-filter",
      payload: {
        taskName: undefined,
        status: "in-progress",
      },
    },
  });
  await finishedProcessingQueue({ containerId });
  expect(getContainer<State>({ containerId }).workingTasks).toEqual([
    {
      emoji: "🍎",
      id: "2",
      name: "Buy apples",
      status: "in-progress",
    },
  ]);
});

test("clear filter", async () => {
  dispatchAction<State, Action>({
    containerId,
    action: {
      name: "set-filter",
      payload: undefined,
    },
  });
  await finishedProcessingQueue({ containerId });
  expect(getContainer<State>({ containerId }).workingTasks).toEqual([
    {
      emoji: "🍌",
      id: "3",
      name: "Buy bananas",
      status: "todo",
    },
    {
      emoji: "🍊",
      id: "4",
      name: "Buy oranges",
      status: "todo",
    },
    {
      emoji: "🍎",
      id: "2",
      name: "Buy apples",
      status: "in-progress",
    },
  ]);
});

test("mark tasks as done", async () => {
  dispatchAction<State, Action>({
    containerId,
    action: {
      name: "update-task",
      payload: {
        id: "3",
        status: "done",
      },
    },
  });
  dispatchAction<State, Action>({
    containerId,
    action: {
      name: "update-task",
      payload: {
        id: "2",
        status: "done",
      },
    },
  });
  await finishedProcessingQueue({ containerId });
  expect(getContainer<State>({ containerId }).workingTasks).toEqual([
    {
      emoji: "🍊",
      id: "4",
      name: "Buy oranges",
      status: "todo",
    },
    {
      emoji: "🍎",
      id: "2",
      name: "Buy apples",
      status: "done",
    },
    {
      emoji: "🍌",
      id: "3",
      name: "Buy bananas",
      status: "done",
    },
  ]);
});
