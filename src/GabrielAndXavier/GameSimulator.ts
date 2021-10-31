import { Direction, GameState } from "../types";

import { foodInPosition, hasardInPosition } from "./utils";

export function gameStateAfterThisMove(
  direction: Direction,
  gameState: GameState
): { gamestate?: GameState; snakeDied: boolean } {
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
    if (hasardInPosition(newState.you.head, gameState)) {
      newState.you.health = newState.you.health - 16;
    } else {
      newState.you.health--;
    }
    // Retract tail
    newState.you.body.pop();
    if (newState.you.health < 0) {
      // Starvation
      return { snakeDied: true };
    }
  }
  newState.you.body.unshift(newState.you.head);
  newState.board.snakes[0] = newState.you;

  return { gamestate: newState, snakeDied: false };
}
