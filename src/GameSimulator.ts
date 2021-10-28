import {
  Direction,
  GameState,
} from "./types";

import { foodInPosition } from "./utils";

export function gameStateAfterThisMove(
  direction: Direction,
  gameState: GameState
): { gamestate?: GameState; iamDead: boolean } {
  // TODO make object copy faster
  let newState = JSON.parse(JSON.stringify(gameState));
  switch (direction) {
    case Direction.UP:
      newState.you.head.y++;
      break;
    case Direction.DOWN:
      newState.you.head.y--;
      break;
    case Direction.RIGHT:
      newState.you.head.x++;
      break;
    case Direction.LEFT:
      newState.you.head.x--;
  }
  if (foodInPosition(newState.you.head, gameState)) {
    // Restore health and make longer if food
    newState.you.health = 100;
  } else {
    // Retract tail
    newState.you.body.pop();
    newState.you.health--;
    if (newState.you.health === 0) {
      // Starvation
      return { iamDead: true };
    }
  }
  newState.you.body.unshift(newState.you.head);
  newState.board.snakes[0] = newState.you;

  return { gamestate: newState, iamDead: false };
}
