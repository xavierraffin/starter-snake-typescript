

import {
  Coord,
  DirectionFlags,
  Direction,
  DirectionScores,
  GameState,
  Board
} from "../types";

export class ScoredDirection {
  directions: DirectionScores = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  };

  addScore(direction: Direction, score: number) {
    this.directions[direction] += score;
  }

  /*
  // WARNING: This function change the values
  const CONSIDERABLE_BONUS = 100;
  getMaxAmongTheseDirections(possibleDirections: Direction[]) {
    possibleDirections.forEach(
      (value) => (this.directions[value] += CONSIDERABLE_BONUS)
    );
    return this.getMaximumDirections();
  }
  getMaximumDirections() {
    const maximum = Math.max(
      ...Object.keys(this.directions).map((key) => this.directions[key])
    );
    return this.getDirectionsOfValue(maximum);
  }
  */
  getDirectionsOfValue(value: number) {
    const directions = Object.keys(this.directions).filter(
      (key) => this.directions[key as Direction] === value
    );
    return directions;
  }
}

export function avoidSnakeBody(
  body: Coord[],
  myHead: Coord,
  possibleMoves: DirectionFlags
): void {
  // We can ignore the tail as he will move away
  for (let i = 0; i < body.length - 1; i++) {
    if (body[i].x === myHead.x) {
      if (body[i].y === myHead.y + 1) {
        // trace("There is a body on the up");
        possibleMoves.up = false;
      } else if (body[i].y === myHead.y - 1) {
        // trace("There is a body on the down");
        possibleMoves.down = false;
      }
    }
    if (body[i].y === myHead.y) {
      if (body[i].x === myHead.x + 1) {
        // trace("There is a body on the right");
        possibleMoves.right = false;
      } else if (body[i].x === myHead.x - 1) {
        // trace("There is a body on the left");
        possibleMoves.left = false;
      }
    }
  }
}

export function possibleHeadCollision(
  snakeHead: Coord,
  myHead: Coord,
  direction: Direction
): boolean {
  switch (direction) {
    case Direction.UP:
      if (
        (snakeHead.x === myHead.x && snakeHead.y === myHead.y + 2) ||
        (snakeHead.x === myHead.x - 1 && snakeHead.y === myHead.y + 1) ||
        (snakeHead.x === myHead.x + 1 && snakeHead.y === myHead.y + 1)
      ) {
        return true;
      }
      break;
    case Direction.DOWN:
      if (
        (snakeHead.x === myHead.x && snakeHead.y === myHead.y - 2) ||
        (snakeHead.x === myHead.x - 1 && snakeHead.y === myHead.y - 1) ||
        (snakeHead.x === myHead.x + 1 && snakeHead.y === myHead.y - 1)
      ) {
        return true;
      }
      break;
    case Direction.RIGHT:
      if (
        (snakeHead.y === myHead.y && snakeHead.x === myHead.x + 2) ||
        (snakeHead.y === myHead.y - 1 && snakeHead.x === myHead.x + 1) ||
        (snakeHead.y === myHead.y + 1 && snakeHead.x === myHead.x + 1)
      ) {
        return true;
      }
      break;
    case Direction.LEFT:
      if (
        (snakeHead.y === myHead.y && snakeHead.x === myHead.x - 2) ||
        (snakeHead.y === myHead.y - 1 && snakeHead.x === myHead.x - 1) ||
        (snakeHead.y === myHead.y + 1 && snakeHead.x === myHead.x - 1)
      ) {
        return true;
      }
  }
  return false;
}

export function findMyIndex(gameState: GameState): number {
  for (let i = 0; i < gameState.board.snakes.length; i++) {
    if (gameState.board.snakes[i].id === gameState.you.id) {
      return i;
    }
  }
  return 0;
}

// Todo is potential colision is last valid move let's allow
export function headColisionDetection(
  enemyHead: Coord,
  enemyLength: number,
  myHead: Coord,
  myLength: number,
  possibleMoves: DirectionFlags,
  riskyMoves: ScoredDirection
): void {
  /*trace(
    `Evaluate collision between me ${myLength} : [${myHead.x},${myHead.y}] and enemy of length ${enemyLength} at [${enemyHead.x},${enemyHead.y}]`
  );*/
  const safeMoves = Object.keys(possibleMoves).filter(
    (key) => possibleMoves[key as Direction]
  );
  for (let j = 0; j < safeMoves.length; j++) {
    if (possibleHeadCollision(enemyHead, myHead, safeMoves[j] as Direction)) {
      if (enemyLength >= myLength) {
        // trace(`There a potential deadly collision head on the ${safeMoves[j]}`);
        riskyMoves.addScore(safeMoves[j] as Direction, 1);
      }
    }
  }
}

export function foodInPosition(position: Coord, board: Board): { isFood: boolean, foodIndex?: number} {
  for (let i = 0; i < board.food.length; i++) {
    if (
      board.food[i].x == position.x &&
      board.food[i].y == position.y
    ) {
      return { isFood: true, foodIndex: i};
    }
  }
  return { isFood: false };
}

export function hasardInPosition(position: Coord, board: Board): boolean {
  for (let i = 0; i < board.hazards.length; i++) {
    if (
      board.hazards[i].x == position.x &&
      board.hazards[i].y == position.y
    ) {
      return true;
    }
  }
  return false;
}

export function snakeBodyInPosition(position: Coord, board: Board): boolean {
  for (let i = 0; i < board.snakes.length; i++) {
    for (let j = 1; j < board.snakes[i].body.length; j++) {
      if (board.snakes[i].body[j].x == position.x && board.snakes[i].body[j].y == position.y) {
        return true;
      }
    }
  }
  return false;
}

export function snakeHeadInPosition(position: Coord, board: Board, snakeIndex: number): { isColision: boolean, dyingSnakeIndexes: number[] } {
  let snakeAtPosition: number[] = [snakeIndex];
  let isColision = false;
  let longestSnakeAtPosition: { idx: number, length: number } = { idx: snakeIndex, length: board.snakes[snakeIndex].body.length};
  for (let i = 0; i < board.snakes.length; i++) {
      if (
        i !== snakeIndex &&
        board.snakes[i].body[0].x == position.x &&
        board.snakes[i].body[0].y == position.y
      ) {
        if(board.snakes[i].body.length > longestSnakeAtPosition.length) {
          longestSnakeAtPosition = { idx: i, length: board.snakes[i].body.length};
        }
        snakeAtPosition.push(i);
        isColision = true;
      }
  }

  let dyingSnakeIndexes: number[] = new Array();
  if(isColision){
    let numberOfSnakeAtMaxLength = 0;
    for (let i = 0; i < snakeAtPosition.length; i++) {
      if (
        board.snakes[snakeAtPosition[i]].body.length < longestSnakeAtPosition.length
      ) {
        dyingSnakeIndexes.push(i);
      } else {
        numberOfSnakeAtMaxLength++;
      }
    }
    if(numberOfSnakeAtMaxLength > 1){
      // Several snake have max length so everybody dies
      dyingSnakeIndexes = snakeAtPosition;
    }
  }

  return { isColision: isColision, dyingSnakeIndexes };
}
