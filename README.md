# key-value-state-container

A simple, library-agnostic key-value based state container following [MVC](https://en.wikipedia.org/wiki/Model–view–controller) and `redux` (uni-directional data flow) patterns. Read the example below or jump into [API](https://sharpcoding.github.io/key-value-state-container/)

## Key points:

- strictly follows the MVC pattern:
  - `M` - model: the state
  - `V` - view: (the glue to the) UI (currently React only via `key-value-state-container-react` `useSelector` hook)
  - `C` - controller - the reducer (and optional `autoActions` function extension, see below)
- `flux`-like (reactive component-oriented)
- minimal dependencies (currently only `lodash`)
- simple: state changes are detected at the master attribute level only (thus `key-value` container)
- supports synchronous persistence read at the "build initial state" level
- small, easy to understand and maintain codebase
- "change anything" attitude, ready for extensions
- no "dogmas":
  - reducer is an `async` function, which will save you from writing thunks and middlewares, making all important code and logic in one place (but you can use synchronous reducers as synchronous reducers as well, see examples)
  - "how to invoke action from reducer" problem solved with optional `autoActions` optional function
  - you can mutate the state directly (but no callbacks will get invoked)
- written with TypeScript (so typings are included automatically!)
- unit test coverage
- focus on documentation

## Example 

The example presents the `MC` parts of the `MVC` pattern. The `V` part is missing for now, however, the requirement is `V` to be reactive (which is understood as refreshing itself as a result to some kind of "signal"). `key-value-state-container-react` package implements `useSelector` hook, which is a good example of `V` part implementation.

Hopefully, if you know `redux` and `react-redux`, you will find the example below quite familiar.

### Todo MVC application (assumption and requirements)

- each task contains a:
  - name
  - emoji
  - status
    - `todo`
    - `in-progress`
    - `done`
    - `archived`
- there are two screens:
  - the Working Tasks Screen (tasks with `todo`, `in-progress`, `done` statuses)
  - the Archived Tasks Screen (tasks with `archived` status)
  - the archived tasks functionality is not 100% implemented right now; once archived, it cannot be undone
- the Working Tasks Screen can be filtered by
  - task name
  - task status
  - (filter funnel will be visible in the UI to the user)
  - for now, filter can be only applied to the Working Tasks Screen
- each time the user changes anything in Working Tasks Screen UI, tasks should get sorted by statuses the following way:
  - `todo` (at the top)
  - `in-progress`
  - `done` (at the bottom)

### `M` - the model (state)

```ts
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
```

### `C` - the controller (reducer)

#### Actions

```ts
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

```

#### Reducer

```ts
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
      const workingTasks = Object.values(state.sourceTasks)
        .filter((task) => {
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
      }
    }
    default: {
      return state;
    }
  }
};
```

#### `autoActions` function

```ts
/**
 * Special function that is called after each action invocation
 * and returns a list of actions that are added to the
 * end of the action queue.
 *
 * In brief, we want have the
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
```

## Precautions

Although the library is already used in the production environment, it is still in the early stage of development 🧪, so API and some specific naming might change.

## Roadmap

- recomputed attributes
- improved developer experience with logging toolkit, action queue visualization etc.
- sagas - right now it is visible in `clearAllEnqueuedActions()`

## Installation

```
npm install key-value-state-container
```

or

```
yarn add key-value-state-container
```

## Extending (working with the development version)

When modifying the container code (e.g. adding extensions, bug fixing etc) that will be utilized by other projects with the same machine/filesystem, follow the following steps:

- make modifications to the `key-value-state-container` as needed
- execute `npm run test`
- if there are no tests for the use case, add them
- execute `npm run pack`
  - this will create a local version of the package
- you need to bump the version number each time you make a change to the code (read below)
- optionally: you can directly point to the version of the package in the "consuming" project: 
 e.g. 
    ```
     "dependencies": {
       "key-value-state-container": "file:~/key-value-state-container-1.0.0.tgz",
     }
    ```
- run `npm i` in the "consuming" project

### The `tgz` caching problem

The problem is: once created and consumed, a`tgz` file will get cached (somewhere?).
So making changes to the code and repeating the steps above will not make the new changes "visible" 😢 in the consuming project. The problem might be caused by `"integrity"` attribute in the `package-lock.json` file.

Anyways, there are two alternative strategies to overcome this:

- delete `node_modules` folder **and** `package-lock.json` in the consuming project,
- add (temporarily!) a new version number to the `package.json` of the `key-value-state-container` project, e.g. `"version": "1.0.1"`, and repeat the steps above

## Q&A

### Why yet another state container?

#### High-level response

The biggest reason people are staring "state-container" projects (and why we have so many React state-containers right now) is the following:

State management is **the most important** part of UI application development, especially the complex cases people are getting paid for. Simply put, state-management is the KING 👑, which especially holds true at the component/application maintenance phase. It is more important than UI framework/CSS solution used.

Secondly, writing a state container is a decision at the **architectural**, not coding level.

"Design for your own" is not only the freedom of doing "anything", but taking responsibility to make the solution easy to develop, understand and maintain.

#### Low-level response

In mid 2017 I've been using `redux` and `react-redux` and I enjoyed it a lot, however, there was too much boilerplate code to write. This boilerplate was eliminated by `redux-toolkit`, but some limiting factors of the architecture remained, e.g synchronous reducers, middleware, how to send an action from reducer etc. I needed something simpler, that follows the pattern, but is ready for extensions at the same time.

Thus having said, state containers are relatively small and easy to write (certainly much easier than writing a 2D/3D game engine). 

Learning and fun factors were also important motivation to "brewing own".

### It the state-container a `redux` replacement?

Definitely not. `redux`, `react-redux` and `redux-toolkit` are great libraries, and it is a good idea to use it if you are happy with it. `key-value-state-container` is a slightly more "experimental" approach to state management, with quality in mind at the same time.

### Looking at a screen using `key-value-state-container`, how many state containers there could be?

Maybe it is time to demystify the `MVC` assumption here a little bit. The `MVC` pattern served only as a reference. `key-value-state-container` is modern, 2020s component-oriented state-container. In practice, it means that in a more complex screen there can be dozens of state-containers, e.g.:
- main screen state container
- as many state containers as there are `<Component1 />`s, `<Component2 />`s etc.

The big assumption here is that each component exposes only `props` to the world, and the state is managed under the hood. This is a big advantage, as it makes the component much more reusable.

### What are the benefits of using a MVC-compliant state container?

- it is easier to reason about other programmer's code
- it makes bug fixing and maintenance so much easier
  - in most cases we don't need to analyze/understand the whole application - it is just enough to track action that causes the problem
- separation of concerns:
  - view is just presenting the state to the user
  - all business logic is (can be) bundled in the reducer

### How do you understand the idea of a reducer?

- reducer is a function that:
  - takes the following arguments:
    - current state
    - an action
  - returns a **promise** of the new state
- reducer has no business to be "pure"
  - going more in depth here, just the contrary, being async brought the opportunity to introduce something like an "action queue" (buffer) (see the code) and `lateInvoke` option, that is used by `useSelector` implementation of `key-value-state-container-react`, providing a nice and cheap UI refresh optimization
- it does not have always return a **new** state (see also optional `bypassReducer` action attribute), so reducer might just return the current state, but
- the key point for reducer to exist is to make some kind business operation, e.g. in rare cases there might be a REST API call or a IndexDB operation causing no effects to state or UI (just return `state` in this case)

### What are possible applications of a state container?

- custom made component, which implements its own state under the hood (externally exposing only props to the world)
- application state management
- game state management (see the demo project!)

### Why keep everything in a single store?

The answer to this question is twofold:

- for a simple component, you probably will fit into a single store anyways
- for an application / screen a single store will prove handy, as there is a very high chance a single attribute might (surprisingly) get calculated on values of several other attributes, so it is best to keep them in a single place

If someone is still not convinced: there no limit on stores/state-containers in the app memory (as long as these stores are registered under different ids). The problem might be with the store synchronization (and reason why one should do so ?).

### How to design attributes in state?

There is no silver bullet regarding this, yet here are some guidelines:
- store everything in a single store
- keep the state as flat as possible
- if an attribute won't change or attribute won't be followed by a view, it can be an object with complex structure
- if there seems some attributes are excessive, maybe it is a situation where the state should be split into two or more containers?

## License

```
The MIT License (MIT)

Copyright Tomasz Szatkowski and WealthArc https://www.wealtharc.com (c) 2023 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
