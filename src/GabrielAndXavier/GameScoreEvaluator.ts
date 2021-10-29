import {
  GameState,
} from "../types";
import { START_NUMBER_OF_SNAKES, DEATH_SCORE } from "./constants";
import { trace, logLevel as log } from "../logger";

export function scoreGameState(gameState: GameState): number {
  // self health
  // number of enemies (death)
  // self length against enemy length
  // self death
  trace(log.DEBUG,
    `health=${gameState.you.health}, nbSnake=s${
      gameState.board.snakes.length - START_NUMBER_OF_SNAKES
    }`
  );
  if (gameState.you.health === 0) {
    return DEATH_SCORE;
  }
  return (
    gameState.you.health +
    (gameState.board.snakes.length - START_NUMBER_OF_SNAKES) * 5
  );
}
