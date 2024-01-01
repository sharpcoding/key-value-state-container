export const cloneObject = (obj: any) => {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  /* istanbul ignore next */
  return JSON.parse(JSON.stringify(obj));
};
