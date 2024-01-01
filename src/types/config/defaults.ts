import { Config } from "./index";

export const configDefaults: Pick<
  Config<{}>,
  "actionQueueMaxLength" | "keepState" | "protectState"
> = {
  actionQueueMaxLength: 1000,
  keepState: false,
  protectState: true,
};
