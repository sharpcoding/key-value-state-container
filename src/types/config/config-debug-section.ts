/**
 * Configures the debug output (currently only Web Developer Console in supported)
 */
export interface ConfigDebugSection {
  dispatching?: {
    /**
     * Turn on/off generic the dispatchAction()-related diagnostics
     */
    active?: boolean;
    /**
     * Set to `true` to find out which line of code caused dispatchAction()
     * (and called reducer)
     */
    callstack?: boolean;
    /**
     * Set to `true` to find out information about listeners (callbacks)
     * that would get called when action gets dispatched
     */
    listeners?: boolean;
    /**
     * Set to `true` in order to investigate how action queue is changing
     */
    queue?: boolean;
  };
  registration?: {
    /**
     * Log container registration/de-registration
     */
    container?: {
      registering?: boolean;
      unregistering?: boolean;
      /**
       * Set to `true` to find out which line of code caused registration/unregistration
       */
      callstack?: boolean;
    };
    /**
     * Log listener registration/de-registration
     */
    listeners?: {
      registering?: boolean;
      unregistering?: boolean;
      /**
       * Set to `true` to find out which line of code caused registration/unregistration
       */
      callstack?: boolean;
    };
  };
  /**
   * Configure to avoid printing to console a reducer was called for an action
   *
   * The dictionary (JS-object) should be form of `key: true`, where key is the action name
   */
  nonTrackedActions?: Record<string, boolean>;
  /**
   * Set to `true` to display the most essential debug info:
   * - what is the action called and its payload
   * - what was the previous state
   * - what is the next state
   * - what attributes (paths) were changed by reducer
   */
  reducer?: boolean;
  warnings?: boolean;
}
