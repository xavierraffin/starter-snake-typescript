import { Battlesnake, Direction, GameState } from "../types";

import { foodInPosition, hasardInPosition } from "./utils";
import { trace, logLevel as log } from "../logger";

export function gameStateAfterThisMove(
  direction: Direction,
  gameState: GameState
): { gamestate?: GameState; snakeDied: boolean } {

  // trace(log.WARN, `[BEFORE] ${JSON.stringify(gameState)}\n`);
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

  for (let i = 1; i < newState.board.snakes.length; i++) {
    // retracting tail of every snake
    newState.board.snakes[i].body.unshift({
      x: newState.board.snakes[i].body[0].x,
      y: newState.board.snakes[i].body[0].y,
    });
    newState.board.snakes[i].body.pop();
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
  // trace(log.WARN, `[AFTER] ${JSON.stringify(newState)}\n`);

  return { gamestate: newState, snakeDied: false };
}
