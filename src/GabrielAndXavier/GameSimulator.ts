import { Direction, Board, Battlesnake, MoveInfo, BoardStatus, Coord } from "../types";

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
  trace(log.DEBUG, `Moving snake ${snakeIndex}`);
  const snake: Battlesnake = board.snakes[snakeIndex];
  const head: Coord = { x: snake.body[0].x, y: snake.body[0].y };
  switch (direction) {
    case Direction.UP:
      head.y++;
      break;
    case Direction.DOWN:
      head.y--;
      break;
    case Direction.RIGHT:
      head.x++;
      break;
    case Direction.LEFT:
      head.x--;
  }
  const { isFood, foodIndex } = foodInPosition(head, board)
  if (isFood) {
    // Restore health and make longer if food
    snake.health = 100;
    board.food.splice(foodIndex!, 1); // Remove food
  } else {
    if (hasardInPosition(head, board)) {
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
  snake.body.unshift(head);

  return { snakeStarved: false };
}

export function boardAfterEnemiesMove(
  currentMoves: MoveInfo[],
  referenceBoard: Board,
  myIndex: number
): BoardStatus {
  let deadSnakes = 0;

  trace(log.DEBUG, `Moving enemies`);

  // trace(log.DEBUG, `BEFORE enemy move ${JSON.stringify(referenceBoard.snakes)}`);

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
  // trace(log.DEBUG, `AFTER enemy move ${JSON.stringify(referenceBoard.snakes)}`);

  const snakeToKill = new Set();

  for (let i = 0; i < referenceBoard.snakes.length; i++) {
    if (i === myIndex) continue;
    if (!snakeToKill.has(i)) {
      // If the index is already in the kill Set we don't need to calculate colision for this position again
      const { dyingSnakeIndexes } = snakeHeadInPosition(
        referenceBoard.snakes[i].body[0],
        referenceBoard,
        i
      );
      dyingSnakeIndexes.forEach((idx) => {
        trace(log.DEBUG, `Snake ${idx} collide head to head and died`);
        snakeToKill.add(idx);
      });
    }
  }
  for (let i = 0; i < referenceBoard.snakes.length; i++) {
    if (i === myIndex) continue;
    if (snakeBodyInPosition(referenceBoard.snakes[i].body[0], referenceBoard)) {
      trace(log.DEBUG, `Snake ${i} collide a snake body`);
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
