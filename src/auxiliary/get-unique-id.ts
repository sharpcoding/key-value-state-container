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

/* istanbul ignore next */
const getCryptoRandomValues = (): number[] => {
  const length = 16;
  /**
   * browser supports crypto API
   */
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array);
  }
  /**
   * Make this work for node.js
   */
  if (typeof require === "function") {
    const crypto = require("crypto");
    const array = crypto.randomBytes(length);
    return Array.from(array);
  }
  return [];
};

/**
 * Quick and dirty way to generate a unique id.
 * Might be useful in other libraries like `key-value-state-container-react`.
 *
 * Example values returned:
 * "b18abf172490cb5bcd7ff108cc3b9c26"
 * "bc4e0e4e0089fc7688c91f3256904a43"
 * "78d6a7adb302fa91ea4561a2379969cf"
 * "64e9d57be7b86406cd00f82b52c63ac9"
 * "5a640299add47fb719f439ff9134fa58"
 * "7690a143ce2ea74dab2c66f151186e43"
 */
export const getUniqueId = () => {
  const array = getCryptoRandomValues();
  let id = "";
  for (let i = 0; i < array.length; i++) {
    id += array[i].toString(16).padStart(2, "0");
  }
  return id;
};
