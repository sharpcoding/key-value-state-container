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
  Reducer,
  dispatchAction,
  finishedProcessingQueue,
  getContainer,
  unregisterStateContainer,
  AutoActions,
} from "../index";

type TaskStatus = "archived" | "done" | "in-progress" | "todo";

type Task = {
  emoji?: string;
  /**
   * Unique task id
   */
  id: string;
  name: string;
  status: TaskStatus;
};

type Filter = {
  taskName?: string;
  status?: Omit<TaskStatus, "archived">;
};

type State = {
  /**
   * Current filter applied to the list of tasks
   * If `undefined` then no filter is applied
   */
  filter?: Filter;

  /**
   * Lookup storing all tasks
   * The source of truth for tasks
   */
  sourceTasks: Record<string, Task>;

  /**
   * List that is displayed to the user
   * and can be filtered or discarded at any time
   */
  workingTasks: Task[];
};

type Action =
  | { name: "add-task"; payload: Task }
  /**
   * Never delete tasks in system, archive them.
   */
  | {
      name: "archive-task";
      payload: Task["id"];
    }
  | {
      name: "set-filter";
      payload?: Filter;
    }
  /**
   * Special action that is dispatched by `autoActions`
   * optional function, and not by user/UI or the test suite.
   */
  | {
      name: "sort-working-tasks";
    }
  | { name: "update-task"; payload: Partial<Task> & Pick<Task, "id"> };

/**
 * Auxiliary structure
 */
const taskSortOrder: Record<TaskStatus, number> = {
  archived: -1,
  todo: 0,
  "in-progress": 1,
  done: 2,
};

const getNewTaskId = (state: State): string => {
  return `${Object.keys(state.sourceTasks).length + 1}`;
};

export const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
    case "add-task": {
      const { payload: task } = action;
      return {
        ...state,
        allTasks: {
          ...state.sourceTasks,
          [task.id]: task,
        },
        workingTasks: [...state.workingTasks, task],
      };
    }
    case "archive-task": {
      const { payload: taskId } = action;
      const task = state.sourceTasks[taskId];
      if (!task) {
        return state;
      }
      const sourceTasks: Record<string, Task> = {
        ...state.sourceTasks,
        [taskId]: {
          ...task,
          status: "archived",
        },
      };
      return {
        ...state,
        sourceTasks,
        workingTasks: state.workingTasks.filter((el) => el.id !== taskId),
      };
    }
    case "update-task": {
      const { payload: addedTask } = action;
      const newTask: Task = {
        ...state.sourceTasks[addedTask.id],
        ...addedTask,
      };
      return {
        ...state,
        allTasks: {
          ...state.sourceTasks,
          [addedTask.id]: newTask,
        },
        workingTasks: state.workingTasks.map((el) => {
          if (el.id === addedTask.id) {
            return newTask;
          }
          return el;
        }),
      };
    }
    case "set-filter": {
      const { payload } = action;
      if (!payload) {
        return {
          ...state,
          filter: undefined,
          workingTasks: Object.values(state.sourceTasks).filter(
            (el) => el.status !== "archived"
          ),
        };
      }
      const { taskName, status } = payload;
      const workingTasks = Object.values(state.sourceTasks).filter((task) => {
        if (status && task.status !== status) {
          return false;
        }
        if (
          taskName &&
          (!task.name.includes(taskName) || task.status === "archived")
        ) {
          return false;
        }
        return true;
      });
      return {
        ...state,
        workingTasks,
      };
    }
    case "sort-working-tasks": {
      const workingTasks = [...state.workingTasks].sort((a, b) => {
        const aOrder = taskSortOrder[a.status];
        const bOrder = taskSortOrder[b.status];
        if (aOrder === bOrder) {
          return a.name.localeCompare(b.name);
        }
        return aOrder - bOrder;
      });
      return {
        ...state,
        workingTasks,
      };
    }
    default: {
      return state;
    }
  }
};

/**
 * Special, optional function called after each action finished executing.
 *
 * Returns a list of actions that are added for later execution
 * to the end of action queue.
 *
 * If there are no actions to be added, then an empty array is returned.
 *
 * In brief, we want to sort working tasks very, very often.
 * Another benefit: a programmer debugging the code would see this
 * action, which could help with reasoning about the code.
 */
export const autoActions: AutoActions<State, Action> = ({ action }) => {
  switch (action.name) {
    case "add-task":
    case "archive-task":
    case "set-filter":
    case "update-task": {
      return [{ name: "sort-working-tasks" }];
    }
    default: {
      return [];
    }
  }
};

const containerId = "todo-list";

const buildInitialState = (): State => {
  const sourceTasks: Record<string, Task> = {
    1: {
      emoji: "🥔",
      id: "1",
      name: "Buy potatoes",
      status: "archived",
    },
    2: {
      emoji: "🍎",
      id: "2",
      name: "Buy apples",
      status: "in-progress",
    },
    3: {
      emoji: "🍌",
      id: "3",
      name: "Buy bananas",
      status: "todo",
    },
    4: {
      emoji: "🍊",
      id: "4",
      name: "Buy oranges",
      status: "todo",
    },
  };
  return {
    filter: undefined,
    sourceTasks,
    workingTasks: Object.values(sourceTasks).filter(
      (el) => el.status !== "archived"
    ),
  };
};

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

test("initial state", () => {
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
