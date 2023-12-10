import { Action } from "./types/contracts/action";
import { Memory } from "./types/memory";

/**
 * internal in-memory global (object) for keeping state containers
 */
export let containers: Record<string, Memory<any, Action>> = {};
