import { ACTION_PREFIX } from "../consts";

export const getActionPath = (actionName: string): string =>
  `${ACTION_PREFIX}.${actionName}`;
