import { Config } from "../types/config";
import { Action } from "../types/contracts";

interface Args<TState extends Object> {
  action: Action;
  containerConfig: Pick<Config<TState>, "protectState">;
}

export const evaluateStateComparisonType = <TState extends Object>({
  action,
  containerConfig: { protectState },
}: Args<TState>): "deep" | "shallow" => {
  if (typeof action?.protectState === "boolean") {
    return action.protectState ? "deep" : "shallow";
  }
  if (typeof protectState === "boolean") {
    return protectState ? "deep" : "shallow";
  }
  return "shallow";
};
