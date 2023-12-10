import _ from "lodash";

const getChangedPathsInternal = (args: {
  oldState: any;
  newState: any;
  parentPath: string[];
}): string[] => {
  const { oldState, newState, parentPath } = args;
  return _.reduce(
    _.uniq([..._.keys(oldState), ..._.keys(newState)]),
    (acc: string[], key) => {
      if (oldState[key] !== newState[key]) {
        acc.push(_.join([...parentPath, key], "."));
      }
      return acc;
    },
    []
  );
};

export const getChangedPaths = (args: { oldState: any; newState: any }) => {
  return getChangedPathsInternal({ ...args, parentPath: [] });
};
