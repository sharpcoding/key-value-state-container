import { ConfigDebugSection } from "./config-debug-section";

/**
 * Optional (yet useful) configuration for state container
 */
export interface Config<TState extends Object> {
  /**
   * @default 1000
   */
  actionQueueMaxLength?: number;

  /**
   * Configure the information to get displayed in console (for now 
   * it is the only place where this kind of the information is displayed). 
   */
  debug?: ConfigDebugSection;

  /**
   * Experimental feature.
   * Identify attributes that get managed completely by the state container!
   * Set them here, but do not modify them in the reducer function!
   */
  managedAttributes?: {
    /**
     * Indicate a `boolean` attribute in state that would act as
     * an "asynchronous operation underway" flag.
     *
     * When an async action starts dispatching, field is set to `true`
     * (and listeners that listen to path indicated by the field invoked).
     *
     * When (the very same) an async action finished dispatching, 
     * this field is set to `false` 
     * (listeners that listen to path indicated by the field invoked).
     */
    asyncOperationFlag?: keyof TState;
  };

  /**
   * Makes container state immune to calling `registerStateContainer` function
   * multiple times.
   * 
   * If set to true, other calls (but first) to registerStateContainer 
   * function won't override existing container state with initial state once again.
   * 
   * It does not affect `unregisterStateContainer` function - once "unregister" 
   * gets called, the state gets removed.
   * 
   * @default false
   */
  keepState?: boolean;
};
