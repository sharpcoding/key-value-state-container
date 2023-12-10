import { TKnownStatePath } from "./known-state-path";

export interface UnregisterStateChangedCallback {
  <TState extends Object>(args: {
    containerId: string;
    listenerId: string;
    statePath: TKnownStatePath<TState>
  }): void
}