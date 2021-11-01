
import { trace, logLevel as log } from "../logger";
import {
  Board,
  DirectionFlags,
  Direction,
  Battlesnake,
} from "../types";

import {
  avoidSnakeBody,
  headColisionDetection,
  ScoredDirection,
} from "./utils";

export function findNextMove(board: Board, snakeIndex: number): {
  safe: Direction[];
  risky: ScoredDirection;
} {
  let possibleMoves: DirectionFlags = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  const snake: Battlesnake = board.snakes[snakeIndex];
  const head = snake.body[0];

  // Don't hit walls.
  if (head.x == board.width - 1) {
    possibleMoves.right = false;
  }
  if (head.x == 0) {
    possibleMoves.left = false;
  }
  if (head.y == 0) {
    possibleMoves.down = false;
  }
  if (head.y == board.height - 1) {
    possibleMoves.up = false;
  }

  // Don't collide with snakes bodies
  let riskyMoves = new ScoredDirection();
  for (let i = 0; i < board.snakes.length; i++) {
    avoidSnakeBody(board.snakes[i].body, head, possibleMoves);
    if (i !== snakeIndex) {
      headColisionDetection(
        board.snakes[i].body[0],
        board.snakes[i].length,
        head,
        board.snakes[snakeIndex].length,
        possibleMoves,
        riskyMoves
      );
    }
  }

  trace(log.DEBUG, `||| 3 possibleMoves = ${JSON.stringify(possibleMoves)}`);
  // Finally, choose a move from the available safe moves.
  const safeMoves: Direction[] = Object.keys(possibleMoves).filter(
    (key) => possibleMoves[key as Direction]
  ) as Direction[];
  return { safe: safeMoves, risky: riskyMoves };
}



export function returnBestMovesList(
  safeMoves: Direction[],
  riskyMoves: ScoredDirection,
  takeNorisk: boolean = false
): Direction[] {
  // trace(`Safe moves = ${JSON.stringify(safeMoves)}`);
  // trace(`appealingMoves = ${JSON.stringify(appealingMoves)}`);
  // trace(`riskyMoves = ${JSON.stringify(riskyMoves)}`);

  const moveRisky0 = riskyMoves.getDirectionsOfValue(0);
  // trace(`risky moves of 0 = ${moveRisky0}`);

  const intersectionSafeMoves = safeMoves.filter((value) =>
    moveRisky0.includes(value)
  );
  // trace(`intersectionSafeMoves = ${JSON.stringify(intersectionSafeMoves)}`);
  if (intersectionSafeMoves.length === 1) {
    // trace(`There is only one truly safe move = ${intersectionSafeMoves[0]}`);
    return intersectionSafeMoves;
  }
  let directionWorthExploring;
  if (intersectionSafeMoves.length === 0) {
    // trace(`All moves are risky evaluating all possible moves`);
    if (takeNorisk) {
      // If no tolerance to risk return empty
      return [];
    }
    directionWorthExploring = safeMoves;
  } else {
    // trace(`Some moves are not risky keeping only these one to be safe`);
    directionWorthExploring = intersectionSafeMoves;
  }
  // trace(`Now exploring ${JSON.stringify(directionWorthExploring)}`);

  return directionWorthExploring;
}