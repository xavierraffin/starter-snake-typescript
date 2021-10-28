
import {
  GameState,
  DirectionFlags,
  Direction,
} from "./types";

import {
  avoidSnakeBody,
  headColisionDetection,
  ScoredDirection,
} from "./utils";

export function findNextMove(gameState: GameState): {
  safe: Direction[];
  risky: ScoredDirection;
} {
  let possibleMoves: DirectionFlags = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  // Step 0: Don't let your Battlesnake move back on it's own neck
  const myHead = gameState.you.head;

  // TODO: Step 1 - Don't hit walls.
  // Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
  if (myHead.x == gameState.board.width - 1) {
    // trace("There is a wall on the right");
    possibleMoves.right = false;
  }
  if (myHead.x == 0) {
    // trace("There is a wall on the left");
    possibleMoves.left = false;
  }
  if (myHead.y == 0) {
    // trace("There is a wall on the down");
    possibleMoves.down = false;
  }
  if (myHead.y == gameState.board.height - 1) {
    // trace("There is a wall on the up");
    possibleMoves.up = false;
  }
  // trace(`Possible moves = ${JSON.stringify(possibleMoves)}`);

  // TODO: Step 2 - Don't hit yourself.
  // Use information in gameState to prevent your Battlesnake from colliding with itself.

  // trace(" ===== Step 2 - Don't hit yourself =====");
  const mybody = gameState.you.body;
  avoidSnakeBody(mybody, myHead, possibleMoves);
  // trace(`Possible moves = ${JSON.stringify(possibleMoves)}`);

  // TODO: Step 3 - Don't collide with others.
  // Use information in gameState to prevent your Battlesnake from colliding with others.
  // trace(" ===== Step 3 - Don't collide with others =====");
  let riskyMoves = new ScoredDirection();
  for (let i = 0; i < gameState.board.snakes.length; i++) {
    if (gameState.board.snakes[i].id == gameState.you.id) {
      continue;
    }
    avoidSnakeBody(gameState.board.snakes[i].body, myHead, possibleMoves);
    headColisionDetection(
      gameState.board.snakes[i].head,
      gameState.board.snakes[i].length,
      myHead,
      gameState.you.length,
      possibleMoves,
      riskyMoves
    );
  }

  // Finally, choose a move from the available safe moves.
  // TODO: Step 5 - Select a move to make based on strategy, rather than random.
  // trace(" ===== Step 5 - Choose a move =====");
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