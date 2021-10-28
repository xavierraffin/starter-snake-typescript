import { trace, logLevel as log } from "./logger";
import { GameState } from "./types";

export function frameTranslator(frames: any): GameState {
  console.log(frames);
  console.log("\n------------------------------\n");
  console.log(frames.Frames[0]);
  return frames as GameState;
}
