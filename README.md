# key-value-state-container

A simple, library-agnostic key-value based state container following [MVC](https://en.wikipedia.org/wiki/Model–view–controller) and `redux` (uni-directional data flow) patterns. 


## Key points:

- MVC pattern interpretation:
  - `M` - model: the state
  - `V` - view: (the "glue" to the) UI (currently React only via `key-value-state-container-react` and `useSelector` hook)
  - `C` - controller - the reducer (and optional `autoActions` extension function, see the "Todo MVC application" example code below)
- `flux`-like (reactive component-oriented)
- minimal dependencies (currently only `lodash`)
- simple: state changes are detected at the master attribute level only (thus `key-value` container)
- supports synchronous persistence read at the "build initial state" level
- small, easy to understand and maintain codebase
- "change anything" attitude, ready for extensions
- no "dogmas" (and experimental features):
  - reducer is an ES6 `async` function, which would save you from writing thunks and middlewares, placing all important code and logic in one place (but you can use synchronous reducers as synchronous reducers as well, see examples)
  - use for notification mechanism: dispatch an action that does not modify the state and is not processed by reducer (`byPassReducer` action attribute)
  - "how to invoke action from reducer" problem addressed with optional `autoActions` optional function
  - although the state is protected for mutation, optionally mutate the state directly (yet: no callbacks will get invoked)
- written in TypeScript (so typings are included automatically!)
- 80% unit test coverage
- focus on documentation

## Demo/Example 

The example presents the `MC` parts of the `MVC` pattern. The `V` part is missing for now, however, the requirement is `V` to be reactive (which is understood as refreshing itself as a result to some kind of "signal"). `key-value-state-container-react` package implements `useSelector` hook, which is a good example of `V` part implementation.

Hopefully, if you know `redux` and `react-redux`, you will find the example below quite familiar.

### Todo MVC application (UI assumptions and requirements)

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
  - the archived tasks functionality is not 100% implemented right now
  - once task is archived, it cannot be undone
- the Working Tasks Screen can be filtered by
  - task name
  - task status
  - (filter funnel will be visible in the UI to the user)
  - for now, filter can be only applied to the Working Tasks Screen
- each time the user changes anything in Working Tasks Screen UI, tasks should get sorted by statuses the following way:
  - `todo` (at the top)
  - `in-progress`
  - `done` (at the bottom)
  - if statuses are equal, sort by task name

### `M` - the model (state)

```ts
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
   * Current filter applied to the Working Tasks Screen
   * making the `workingTasks` list.
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
```

### `C` - the controller (reducer)

#### Actions

```ts
type Action =
  /**
   * Never delete any task in system, archive it.
   * Benefit: no need a special function for unique task id
   */
  | {
      name: "archive-task";
      payload: Task["id"];
    }
  /**
   * Create or update a task action
   * (used in task editing)
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
```

#### `autoActions` function

```ts
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
```

Please read [`jest` test file specification](src/tests/todo-list.test.ts) to see how sequence of actions are being executed on the list of tasks as below, including automatically added `"sort-working-tasks"`.

```ts
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
```

## Precautions

Although the library is already used in the production environment, it is still in the early stage of development 🧪, so API and some specific naming might change.

## Roadmap

- computed/calculated attributes
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

The biggest reason people are staring "state-container" type of projects (and why we have so many React state-containers right now) is state management management being **the most important** part of each non-trivial UI application development, especially the complex ones. Simply put, state-management is the KING 👑, which especially holds true at the component/application maintenance phase. It is more important than UI framework/CSS solution used.

Secondly, writing a state container is a decision at the **architectural**, not coding level.

"Brew" 🍺 your own  is not only the freedom of doing "anything", but taking responsibility to make the solution easy to develop, understand and maintain.

#### Low-level response

In mid 2017 I had been using `redux` and `react-redux`, enjoying it a lot, however, there was too much boilerplate code to write. This boilerplate problem was eliminated greatly by `redux-toolkit`, but some limiting factors of the architecture remained e.g synchronous reducers, middleware, "how to send an action from reducer" problem etc. I felt like I need something simpler, that follows the pattern, but is ready for extensions at the same time.

Luckily, state containers are relatively small and easy to write (certainly much easier than writing a 2D/3D game engine). 

Thus having said, learning and fun factors were also important motivation to "brewing own".

### It the state-container a `redux` replacement?

Definitely not. `redux`, `react-redux` and `redux-toolkit` are great libraries, and it is a good idea to use it if you are happy and familiarized with them. `key-value-state-container` is a slightly more "lightweight" and "experimental" approach to state management, with quality in mind at the same time.

### How it is similar to `redux` or `redux-toolkit`?

- not strictly related to any UI framework (although `key-value-state-container-react` is the only available UI library binding right now) 
- "single source of truth" (one store to "rule them all")
- actions (but with `name` attribute instead of `type`)
- reducers (but `async` instead of being synchronous)

### How it is different from `redux` or `redux-toolkit`?

- reducers are `async`
- even simple: no need to write thunks or middlewares
- `autoActions` optional function, making it possible to "dispatch actions from reducer"
- smaller codebase, ready to be extended
- (probably) shallow learning curve, as there are less features
- no immer support, no slices etc
- handles race conditions by using action queue and `immediateState` idea/proposal
- extensible architecture, ready for extensions and experiments
  - `bypassReducer` attribute in `Action`
  - managed attributes
  - sagas (planned)
- `redux`'s action `type` attribute is the `name` attribute in `key-value-state-container`
- a little bit experimental, yet battle-tested (see next question)

### Is `key-value-state-container` production ready?

Yes, it is used in production environment (as the time of writing this - which is end of 2023 - for about 2 years). 

Here in WealthArc (fin-tech with quite complex logic) dozens of:
- React components
- Screens
successfully use it in the production.

Keep in mind from the Open Source community perspective, the library is still in the early stage of development, so API, some specific naming might change.

### Looking at a screen using `key-value-state-container`, how many state containers there could be?

Maybe it is time to demystify the `MVC` assumption here a little bit. The `MVC` pattern served only as starting point, inspiration and reference. `key-value-state-container` is modern, 2020s component-oriented ES6/TypeScript-compliant state-container. In practice, it means that in a more complex screen there can be dozens of state-containers, e.g.:

- main screen state container
- if there are authored/maintained custom components, each of them might have its own state container, so there can be many state containers as there are `<Component1 />`s, `<Component2 />`s etc.

The big assumption here is that each component from outside looks like any (React) component and exposes `props` to the world, the state being managed under the hood. This is a big advantage, as it makes the component much more reusable.

#### Bonus: should these state containers talk to each other? (API-architecture)

Absolutely not! State containers are introduced for separation of concerns, so they should be independent. On one hand it is possible to dispatch an action to state container from any place in application - so it is possible to dispatch an action from other container's `autoActions` as well - however, the internal implementation (action name, payload) could change.

It is best to provide some kind of "API object" for this. 

For example, let's assume we have a `<TreeView id="booksByAuthor" />` component, it could look like this:

```ts
const api = createTreeViewApi("booksByAuthor");
api.setFilter({
  authors: ["Tolkien", "J.K. Rowling"],
});
api.destroy();
```

### What are the benefits of using a MVC-compliant state container?

- it is easier to reason about other programmer's code
- it is easier to reason about own code (after several weeks, months etc)
- it makes bug fixing and maintenance so much easier
  - in most cases we don't need to analyze/understand the whole application - it is just enough to track action that causes the problem, so actions, by nature, "slices" even the most complex application into small, easier to understand pieces
- separation of concerns:
  - view is just presenting the state to the user
  - all business logic is (can be) bundled in the reducer

### How do you define the idea of a reducer?

- reducer is a simple function that:
  - takes the following arguments:
    - current state
    - an action
  - returns a **promise** of the new state
- reducer has no business to be "pure"
  - going more in depth here, just the contrary, being `async` brought the opportunity to introduce something like an "action queue" (buffer) (see the source code) and `lateInvoke` option, that is (heavily) used by `useSelector` implementation of `key-value-state-container-react`, saving UI from premature refreshes and providing a nice and cheap UI refresh optimization
- it does not have always (have to) return a **new** state (see also optional `bypassReducer` action attribute), so reducer might just return the current state, but
  - the key point for reducer to exist is to make some kind "business logic" operation, e.g. in rare cases there might be a Web Socket or a IndexDB operation causing no effects to state or UI (just return `state` in this case)

### What are possible applications of a state container?

- application state management
- custom made components, which implement own state under the hood (externally exposing only "props" to the world)
- game state management (see the demo project!)

### Why keep everything in a single store?

The answer to this question is threefold:

- for a simple component, you probably will fit into a single store anyways
- for an application / screen a single store will prove handy, as there is a very high chance a single attribute might (surprisingly) get calculated on values of several other attributes, so it is best to keep them in a single place
- what does it mean exactly? As an example, for the following component hierarchy:
```
<Screen>
  <Form>
    <Input />
    <Input />
    <Input />
    <Select />
    <Input />
  </Form>
  <Form>
    <Select />
    <Select />
    <PieChart />
  </Form>
</Screen>
```
  there might be a single store (state-container) at the `<Screen />` level and 4 more stores (state-containers) of the `<Select />` and `<PieChart />`. If these components are delivered by a third party, the only store developer cares about is the `<Screen />` store.

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
