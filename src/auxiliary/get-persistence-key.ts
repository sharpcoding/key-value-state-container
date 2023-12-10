type Args = {
  containerId: string;
  prefix?: string;
};

export const getPersistenceKey = ({
  containerId,
  prefix = "App.Container",
}: Args) => `${prefix}.${containerId}`;
