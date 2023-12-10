export type State = { sum: number };
export type Action = { name: "do-nothing" };
export const reducer = async ({ state }: { state: State }) => state;
