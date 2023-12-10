export type PersistenceEnvelopeContents = any;

/**
 * The envelope is an object that is persisted to local storage.
 */
export interface PersistenceEnvelope {
  contents: PersistenceEnvelopeContents;
  version: string;
}
