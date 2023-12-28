import { Reducer, AutoActions } from "../../index";

type TaskStatus = "archived" | "done" | "in-progress" | "todo";

export type Task = {
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

export type State = {
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

export type Action =
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

export const getNewTaskId = (state: State): string => {
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

export const buildInitialState = (): State => {
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
