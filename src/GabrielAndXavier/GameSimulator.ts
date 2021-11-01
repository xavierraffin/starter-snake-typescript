import { Direction, Board, Battlesnake, MoveInfo, BoardStatus } from "../types";

import {
  foodInPosition,
  hasardInPosition,
  snakeBodyInPosition,
  snakeHeadInPosition,
} from "./utils";
import { trace, logLevel as log } from "../logger";

export function boardAfterThisMove(
  direction: Direction,
  board: Board,
  snakeIndex: number
): { snakeStarved: boolean } {
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
    if (snake.health <= 0) {
      // Starvation
      return { snakeStarved: true };
    }
  }
  snake.body.unshift(snake.head);

  return { snakeStarved: false };
}

export function boardAfterEnemiesMove(
  currentMoves: MoveInfo[],
  referenceBoard: Board
): BoardStatus {
  let deadSnakes = 0;

  // Resolve starvation first: https://discord.com/channels/689979228841836632/692200459473256448/904487062743433247
  currentMoves.forEach((move) => {
    const { snakeStarved } = boardAfterThisMove(
      move.direction,
      referenceBoard,
      move.snakeIndex
    );
    if (snakeStarved) {
      deadSnakes++;
      trace(log.DEBUG, `Snake ${move.snakeIndex} died of starvation`);
      // Remove snake body from board
      referenceBoard.snakes.splice(move.snakeIndex, 1);
    }
  });

  const snakeToKill = new Set();

  for (let i = 0; i < referenceBoard.snakes.length; i++) {
    // If the index is already in the kill Set we don't need to calculate colision for this position again
    if(!snakeToKill.has(i)){
      const { dyingSnakeIndexes } = snakeHeadInPosition(
        referenceBoard.snakes[i].body[0],
        referenceBoard,
        i
      );
      dyingSnakeIndexes.forEach((idx) => {
        snakeToKill.add(idx);
      });
    }
  }
  for (let i = 0; i < referenceBoard.snakes.length; i++) {
    if (snakeBodyInPosition(referenceBoard.snakes[i].body[0], referenceBoard)) {
      snakeToKill.add(i);
    }
  }

  // Remove all killed snake from the list
  const sortedKillIdx = Array.from(snakeToKill).sort();

  for (let i = sortedKillIdx.length - 1; i >= 0; i--) {
    trace(log.DEBUG, `Deleting body of idx ${sortedKillIdx[i]}`);
    referenceBoard.snakes.splice(sortedKillIdx[i] as number, 1);
  }

  return {
    snakeDeads: deadSnakes,
    playerWin: false,
    snakesTotalHealth: 0,
    board: referenceBoard,
  };
}
