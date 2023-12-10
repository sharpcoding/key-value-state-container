/**
 * @ignore
 */
export interface GetContainer {
  <TState extends Object>(args: {
    /**
     * Unique id of the container.
     */
    containerId: string;
    /**
     * If `true`, the method will ignore the container that is not registered yet.
     * If `false`, the method will throw an error in such case.
     * @default false
     */
    ignoreUnregistered?: boolean;
  }): TState;
}
