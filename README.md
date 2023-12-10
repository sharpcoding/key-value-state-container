# key-value-state-container

A simple, library-agnostic key-value state container following [MVC](https://en.wikipedia.org/wiki/Model–view–controller) and `redux` (uni-directional data flow) patterns. Read the example below or jump into [API](https://sharpcoding.github.io/key-value-state-container/)

## Example (Fibonacci sequence counting)

```ts
type Action =
  /**
   * makes the calculation step
   */
  | {
      name: "step";
    }
  /**
   * resets the state
   */
  | { name: "reset" };

type State = {
  /**
   * indicates number of finished steps
   */
  steps: number;
  /**
   * the result sequence of Fibonacci numbers
   */
  sequence: number[];
};

export const reducer: Reducer<State, Action> = async ({ state, action }) => {
  const { steps } = state;
  switch (action.name) {
    case "step": {
      /**
       * For the first 3 steps, the sequence is [0, 1, 1] and we
       * have it hardcoded.
       */
      if (steps < 3) {
        return {
          ...state,
          steps: steps + 1,
          sequence: [0, 1, 1].slice(0, steps + 1),
        };
      }
      return {
        ...state,
        steps: steps + 1,
        sequence: [
          ...state.sequence,
          /** each number is the sum of the two preceding ones */
          state.sequence[steps - 1] + state.sequence[steps - 2],
        ],
      };
    }
    case "reset": {
      return { steps: 0, sequence: [] };
    }
    default: {
      return state;
    }
  }
};

const containerId = "fibonacci-container";

// allocates memory and creates the container
registerStateContainer<State, Action>({
  containerId,
  initialState: { steps: 1, sequence: [] },
  reducer,
});

const countFibonacciSequence = async (n: number) => {
  dispatchAction({
    containerId,
    action: { name: "reset" },
  });
  for (let i = 0; i <= n; i++) {
    dispatchAction({
      containerId,
      action: { name: "step" },
    });
  }
  // wait until all actions are processed
  await finishedProcessingQueue({ containerId });
  const { sequence } = getContainer<State>({ containerId });
  return sequence;
};

/**
 * somewhere else in the code
 */
await countFibonacciSequence(5);
await countFibonacciSequence(8);
await countFibonacciSequence(12);
```

Disclaimer: the code above is not the best way to calculate the Fibonacci sequence! It is just a simple example to demonstrate the usage of the library.

Bonus question: what is missing? 

## Key points:

- strictly follows the MVC pattern:
  - `M` - model: the state
  - `V` - view: the UI (currently React via `key-value-state-container-react` `useSelector` hook)
  - `C` - controller - is the reducer (and optional `autoActions` function extension, see below)
- `flux`-like
- small, easy to understand codebase
- minimal dependencies (currently only `lodash`)
- simple: state changes are detected at the master attribute level
- supports persistence pattern
- "change anything" attitude, ready for extensions
- no dogmas:
  - reducer code is `async` (but you can use it as synchronous, see examples)
  - "how to invoke action from reducer" problem solved with optional "autoActions" function
  - you can manipulate the state directly (but no callbacks will get invoked)
- written with TypeScript (so typings are included automatically!)
- good unit test coverage
- aims at good documentation

## Precautions

Although the library is already used in the production environment, it is still in the early stage of development, so API and some specific naming might change.

## Roadmap

- sagas - right now it is visible in `clearAllEnqueuedActions()`
- improved developer experience

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

### What was the pattern followed: Flux or MVC?

Probably both, but the MVC pattern - being unidirectional itself - was the main inspiration.

### What are the benefits of using a MVC-compliant state container?

- it is easier to reason about other programmer's code
- it makes bug fixing and maintenance so much easier
  - in most cases we don't need to analyze/understand the whole application - it is just enough to track action that causes the problem
- separation of concerns:
  - view is just presenting the state to the user
  - all business logic is (can be) bundled in the reducer

### How do you understand the idea of a reducer?

- it is a function that:
  - takes the current state
  - takes an action
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

### Why yet another state container?

The biggest reason why people are staring "state-container projects" is the state management being **the most important** part of the UI application development, especially the complex cases.

State-management is the KING 👑, which especially holds true at the component/application maintenance phase.

It is more important to UI framework/CSS solution used.

Writing a state container is a decision at the **architectural**, not coding level.

"Design for your own" is not only the freedom of doing "anything", but taking responsibility to make the solution easy to develop, understand and maintain.

#### Quick and random comparison to other "state containers"

What popular state containers are offering at the developer experience and architectural levels?

- `redux` and `react-redux`
  - forces way too much boilerplate code to write
  - there are some arbitrary rules to follow:
    - reducers are "pure functions" with no "side effects" allowed, so there is no way to implement real-life "business logic" (which in 99% is just interacting with REST API) in the reducers themselves
    - in order to dispatch a new action from the reducer, one has to understand and utilize the concept of "thunk" and "middleware"
- `redux-toolkit` is much better (improvement over `react-redux`), but still there are some arbitrary architectural decisions to follow, e.g.
  - reducers are still "pure functions" with no "side effects" allowed,
  - dispatching an action to store requires "seeing" action functions (the slice result) or "seeing" the actions creators and store
- `useReducer`
  - simple hook
  - `React` only
  - `dispatch` function returned as the `result[1]` is not very handy to use (one must to pass them down the component hierarchy tree)
  - might deliver some non-performant solutions (causes all components below the hierarchy to re-render)
- `mobx` is a mature and well-established library, yet it lacks purity and simplicity, e.g.
  - state is defined in `class`
  - the class provides functions that mutate the object as well 😳
  - there is a `autorun()` "magic": the final effect might be very difficult to maintain and debug, especially in more complex applications
  - it looks like it is much more difficult to write unit tests for the code, as business logic is scattered all over the place
- `recoil.js`:
  - React only
  - state is scattered all over the place in "atoms"
  - business logic is placed in something named "selector"
  - there are no actions, so reasoning about faulty code might be much more difficult
  - both of "atoms" and "selectors" are hooks and must follow the rules of hooks
  - testing business logic looks cumbersome, as it requires mocking the atoms/selectors

The brief descriptions above was not meant to be a criticism of the existing solutions, but rather course of reasoning that the architecture is much more "ambitious" (and much more beneficial) undertaking to "just making the job done" or "just writing bug-free code".

Another reasons for writing custom state containers are:

- state containers are relatively small and easy to write (so much easier to writing a 2D/3D game engine or UI framework with a custom virtual DOM implementation)
- it seems there is no state container that follows MVC pattern
- there is no versatile state management solution for React out-of-the-box

### How to design the state attributes?

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
