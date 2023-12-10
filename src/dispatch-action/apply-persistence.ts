import _ from "lodash";

import { containers } from "../containers";
import { StateContainerPersistence } from "../types/contracts";
import {
  PersistenceEnvelope,
  PersistenceEnvelopeContents,
} from "../types/persistence-envelope";
import { getPersistenceKey } from "../auxiliary/get-persistence-key";

interface Args {
  containerId: string;
}

export const applyPersistence = async ({
  containerId,
}: Args) => {
  const container = containers[containerId];

  if (!container || !container.persistence) {
    return;
  }

  const {
    changedPaths,
    persistence: { getEnvelope, getKey, setEnvelope },
  } = container;

  const attributesDict =
    container.persistence.attributes.reduce(
      (acc, el) => ({ ...acc, [String(el)]: true }),
      {} as Record<string, boolean>
    ) || {};

  const key = _.isFunction(getKey)
    ? getKey({ containerId, prefix: container.persistence?.prefix })
    : getPersistenceKey({
        containerId,
        prefix: container.persistence?.prefix,
      });

  const existingEnvelope: PersistenceEnvelope | undefined = await getEnvelope(
    key
  );

  const envelopeContents = changedPaths.reduce((acc, path) => {
    if (attributesDict[path]) {
      return { ...acc, [path]: _.get(container.newState, path) };
    }
    return acc;
  }, (existingEnvelope?.contents || {}) as PersistenceEnvelopeContents);

  const envelope: PersistenceEnvelope = {
    contents: envelopeContents,
    version: container.persistence.version,
  };

  if (_.isEmpty(envelopeContents)) {
    return;
  }

  await setEnvelope(key, envelope);
};
