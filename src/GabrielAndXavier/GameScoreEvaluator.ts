import { Board } from "../types";
import {
  START_NUMBER_OF_SNAKES,
  DEATH_SCORE,
} from "./constants";
import { trace, logLevel as log } from "../logger";

export function scoreBoardState(
  board: Board,
  myIndex: number,
  winNumber: number,
  snakeSureKills: number,
  nonWinOrLoseNumber: number
) {
  // self health
  // number of enemies (death)
  // self length against enemy length
  // self death
  const me = board.snakes[myIndex];
  trace(
    log.DEBUG,
    `health=${me.health}, nbSnake=s${
      board.snakes.length - START_NUMBER_OF_SNAKES
    }`
  );
  if (me.health === 0) {
    return DEATH_SCORE;
  }
  return me.health + (board.snakes.length - START_NUMBER_OF_SNAKES) * 5;
}
