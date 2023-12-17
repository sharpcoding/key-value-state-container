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
  emoji: string;
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
  /**
   * We never delete tasks in system, but we can archive them.
   * Thus we don't need a special function for unique task id
   */
  | {
      name: "archive-task";
      payload: Task["id"];
    }
  /**
   * Create or update a task action
   */
  | { name: "update-task"; payload: Task }
  | {
      name: "set-filter";
      payload?: Filter;
    }
  /**
   * Special action that is dispatched by `autoActions`
   * optional function, and not by user/UI
   */
  | {
      name: "sort-working-tasks";
    };

/**
 * Auxiliary structure
 */
const taskSortOrder: Record<TaskStatus, number> = {
  archived: -1,
  todo: 0,
  "in-progress": 1,
  done: 2,
};

export const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
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
      const { payload: task } = action;
      // add task if doesn't exist
      if (!state.sourceTasks[task.id]) {
        const numberOfTasks = Object.keys(state.sourceTasks).length;
        return {
          ...state,
          allTasks: {
            ...state.sourceTasks,
            [numberOfTasks + 1]: task,
          },
          workingTasks: [...state.workingTasks, task],
        };
      }
      // update task
      return {
        ...state,
        allTasks: {
          ...state.sourceTasks,
          [task.id]: task,
        },
        workingTasks: state.workingTasks.map((el) => {
          if (el.id === task.id) {
            return task;
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
        };
      }
      const { taskName, status } = payload;
      const workingTasks = Object.values(state.sourceTasks).filter((task) => {
        if (status && task.status !== status) {
          return false;
        }
        if (taskName && !task.name.includes(taskName)) {
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
 * Special, optional function called after each action invocation 
 * (action that execute created a new state version).
 * 
 * It returns a list of actions that are added for later execution 
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
