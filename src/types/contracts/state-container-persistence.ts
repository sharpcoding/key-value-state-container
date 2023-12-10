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
