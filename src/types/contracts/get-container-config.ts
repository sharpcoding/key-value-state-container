import { Config } from "../config";

export interface GetContainerConfig {
  <TState extends Object>(
    args: {
      containerId: string;
      /**
       * If `true`, the method will ignore the container that is not registered yet.
       * If `false`, the method will throw an error in such case.
       * @default false
       */
      ignoreUnregistered?: boolean;
    }
  ): Config<TState> | undefined;
}
