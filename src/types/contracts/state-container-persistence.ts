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

import { PersistenceEnvelope } from "../../types/persistence-envelope";

interface PersistenceConverterArgs {
  /**
   * Fragment of persisted state as stored in the persistence target
   */
  persistedState: unknown;

  /**
   * Version of persisted state (as stored in persistence container)
   */
  version: string;
}

export interface StateContainerPersistence<TState extends Object> {
  /**
   * Mandatory function to read persisted state envelope from the persistence target
   * (local storage, etc.) under a given `key` 
   * 
   * For the sake of simplicity, use synchronous `get` from `local-storage`
   */
  getEnvelope: (key: string) => PersistenceEnvelope;

  /**
   * Mandatory function to write persisted state envelope to the persistence target
   * (local storage, etc.) under a given `key` 
   * 
   * For the sake of simplicity, use synchronous `set` from `local-storage` npm library
   */
  setEnvelope: (key: string, envelope: PersistenceEnvelope) => void;

  /**
   * Optional function to generate a key in `getEnvelope` and `setEnvelope` functions.
   */
  getKey?: (args: { containerId: string; prefix?: string }) => string;

  /**
   * List of attributes to persist
   */
  attributes: (keyof TState)[];

  /**
   * Optional converter function to convert persisted state.
   * This is useful when you want to migrate persisted state to new version.
   *
   * Rules of persistence conversion:
   * - it is the user responsibility to provide and implement a converter function
   * - state is persisted in so called "envelope" (see `persistence-envelope.ts`)
   *
   * The converter function inside should compare `version` attribute.
   */
  converter?: (args: PersistenceConverterArgs) => Partial<TState>;

  /**
   * State-container specific prefix name for a persistence entry in a key-value store.
   * For now, the only key-value store supported is the local-storage.
   *
   * Typically, the fraction of state will get persisted under the
   * `App.Container.${containerId}` key. This prefix can be, however, changed
   */
  prefix?: string;

  /**
   * Version of persisted state
   */
  version: string;
}
