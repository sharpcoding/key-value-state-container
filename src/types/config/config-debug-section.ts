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
