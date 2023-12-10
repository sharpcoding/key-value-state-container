/**
 * Quick and dirty way to generate a unique id.
 * Might be useful in other libraries like `key-value-state-container-react`. 
 */
export const getUniqueId = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  let id = '';
  for (let i = 0; i < array.length; i++) {
    id += array[i].toString(16).padStart(2, '0');
  }
  return id;
};