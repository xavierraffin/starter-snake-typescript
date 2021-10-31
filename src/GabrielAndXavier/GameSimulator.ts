import { Direction, Board, Battlesnake, MoveInfo, BoardStatus } from "../types";

import { foodInPosition, hasardInPosition } from "./utils";

export function boardAfterThisMove(
  direction: Direction,
  board: Board,
  snakeIndex: number
): { snakeDied: boolean } {
  const snake: Battlesnake = board.snakes[snakeIndex];
  switch (direction) {
    case Direction.UP:
      snake.head.y++;
      break;
    case Direction.DOWN:
      snake.head.y--;
      break;
    case Direction.RIGHT:
      snake.head.x++;
      break;
    case Direction.LEFT:
      snake.head.x--;
  }
  if (foodInPosition(snake.head, board)) {
    // Restore health and make longer if food
    snake.health = 100;
  } else {
    if (hasardInPosition(snake.head, board)) {
      snake.health = snake.health - 16;
    } else {
      snake.health--;
    }
    // Retract tail
    snake.body.pop();
    if (snake.health === 0) {
      // Starvation
      return { snakeDied: true };
    }
  }
  snake.body.unshift(snake.head);

  return { snakeDied: false };
}

export function boardAfterEnemiesMove(
  currentMoves: MoveInfo[],
  referenceBoard: Board
): BoardStatus {
  return {
    snakeDeads: 0,
    playerWin: false,
    snakesTotalHealth: 0,
    board: referenceBoard,
  };
}
