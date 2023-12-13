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

export const applyPersistence = ({
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

  const existingEnvelope: PersistenceEnvelope | undefined = getEnvelope(
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

  setEnvelope(key, envelope);
};
