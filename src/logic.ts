import { exit } from "process";
import { InfoResponse, GameState, MoveResponse, Game } from "./types";

export function info(): InfoResponse {
  console.log("INFO");
  const response: InfoResponse = {
    apiversion: "1",
    author: "Gabriel",
    color: "#00FF00",
    head: "pixel",
    tail: "pixel",
  };
  return response;
}

export function start(gameState: GameState): void {
  console.log(`${gameState.game.id} START`);
}

export function end(gameState: GameState): void {
  console.log(`${gameState.game.id} END\n`);
}

function avoidSnakeBody(body: any[], myhead: any, possibleMoves: any): void {
  // We can ignore the tail as he will move away
  for (let i = 0; i < body.length - 1; i++) {
    if (body[i].x == myhead.x) {
      if (body[i].y == myhead.y + 1) {
        // trace("There is a body on the up");
        possibleMoves.up = false;
      } else if (body[i].y == myhead.y - 1) {
        // trace("There is a body on the down");
        possibleMoves.down = false;
      }
    }
    if (body[i].y == myhead.y) {
      if (body[i].x == myhead.x + 1) {
        // trace("There is a body on the right");
        possibleMoves.right = false;
      } else if (body[i].x == myhead.x - 1) {
        // trace("There is a body on the left");
        possibleMoves.left = false;
      }
    }
  }
}

function isOnThisSide(snakeHead: any, myhead: any, direction: string): boolean {
  /*trace(
    `Evaluate if [${snakeHead.x},${snakeHead.y}] is on my ${direction} : between me [${myhead.x},${myhead.y}]`
  );*/
  switch (direction) {
    case "up":
      if (
        (snakeHead.x == myhead.x && snakeHead.y == myhead.y + 2) ||
        (snakeHead.x == myhead.x - 1 && snakeHead.y == myhead.y + 1) ||
        (snakeHead.x == myhead.x + 1 && snakeHead.y == myhead.y + 1)
      ) {
        return true;
      }
      break;
    case "down":
      if (
        (snakeHead.x == myhead.x && snakeHead.y == myhead.y - 2) ||
        (snakeHead.x == myhead.x - 1 && snakeHead.y == myhead.y - 1) ||
        (snakeHead.x == myhead.x + 1 && snakeHead.y == myhead.y - 1)
      ) {
        return true;
      }
      break;
    case "right":
      if (
        (snakeHead.y == myhead.y && snakeHead.x == myhead.x + 2) ||
        (snakeHead.y == myhead.y - 1 && snakeHead.x == myhead.x + 1) ||
        (snakeHead.y == myhead.y + 1 && snakeHead.x == myhead.x + 1)
      ) {
        return true;
      }
      break;
    case "left":
      if (
        (snakeHead.y == myhead.y && snakeHead.x == myhead.x - 2) ||
        (snakeHead.y == myhead.y - 1 && snakeHead.x == myhead.x - 1) ||
        (snakeHead.y == myhead.y + 1 && snakeHead.x == myhead.x - 1)
      ) {
        return true;
      }
  }
  return false;
}

const POTENTIAL_KILL_BONUS = 1;
const FOOD_MAX_BONUS = 5;
const CONSIDERABLE_BONUS = 100;
const DEATH_SCORE = -100;
class ScoredDirection {
  directions: { [key: string]: number } = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  };
  addScore(direction: string, score: number) {
    this.directions[direction] += score;
  }

  // WARNING: This function change the values
  getMaxAmongTheseDirections(possibleDirections: string[]) {
    possibleDirections.forEach(
      (value) => (this.directions[value] += CONSIDERABLE_BONUS)
    );
    // trace(`CONSIDERABLE_BONUS applied ${JSON.stringify(this.directions)}`);
    return this.getMaximumDirections();
  }
  getMaximumDirections() {
    const maximum = Math.max(
      ...Object.keys(this.directions).map((key) => this.directions[key])
    );
    return this.getDirectionsOfValue(maximum);
  }
  getDirectionsOfValue(value: number) {
    const directions = Object.keys(this.directions).filter(
      (key) => this.directions[key] === value
    );
    /* trace(
      `these directions have value = ${value} : ${JSON.stringify(directions)}`
    );*/
    return directions;
  }
}

// Todo is potential colision is last valid move let's allow
function headColisionDesision(
  enemyHead: any,
  enemyLength: number,
  myhead: any,
  myLength: number,
  possibleMoves: any,
  riskyMoves: ScoredDirection,
  appealingMoves: ScoredDirection
): void {
  /*trace(
    `Evaluate collision between me ${myLength} : [${myhead.x},${myhead.y}] and enemy of length ${enemyLength} at [${enemyHead.x},${enemyHead.y}]`
  );*/
  const safeMoves = Object.keys(possibleMoves).filter(
    (key) => possibleMoves[key]
  );
  for (let j = 0; j < safeMoves.length; j++) {
    if (isOnThisSide(enemyHead, myhead, safeMoves[j])) {
      if (enemyLength >= myLength) {
        // trace(`There a potential deadly collision head on the ${safeMoves[j]}`);
        riskyMoves.addScore(safeMoves[j], POTENTIAL_KILL_BONUS);
      } else {
        // trace(`There a potential safe kill collision on the ${safeMoves[j]}`);
        appealingMoves.addScore(safeMoves[j], POTENTIAL_KILL_BONUS);
      }
    }
  }
}

const DEBUG = true;

function trace(msg: any): void {
  if (DEBUG) {
    console.log(msg);
  }
}

export function scoreGameState(gameState: GameState): number {
  // self health
  // number of enemies (death)
  // self length against enemy length
  // self death
  return gameState.you.health - ((gameState.board.snakes.length -1) * 100);
}

export function foodInPosition(position: any, gameState: GameState): boolean {
  for (let i = 0; i < gameState.board.food.length; i++) {
    if (
      gameState.board.food[i].x == position.x &&
      gameState.board.food[i].y == position.y
    ) {
      return true;
    }
  }
  return false;
}

export function gameStateAfterThisMove(direction: string, gameState: GameState): GameState {
    let newState = JSON.parse(JSON.stringify(gameState));
    let newHead = newState.you.head;
    switch (direction) {
      case "up":
          newHead.y++;
          break;
      case "down":
          newHead.y--;
          break;
      case "right":
          newHead.x++;
          break;
      case "left":
          newHead.x--;
    }
    // Restore health and make longer if food
    if (foodInPosition(newHead, gameState)) {
      newState.you.health = 100;
    } else {
      newState.you.body.pop();
      newState.you.health--;
    }
    newState.you.body.unshift(newHead);
    newState.board.snakes[0] = newState.you;

    /*
    console.log(`\n old and new state after move ${direction}`);
    console.log(JSON.stringify(gameState) + "\n");
    console.log(JSON.stringify(newState) + "\n");
    */
    return newState;
}

export function evaluateFutureGameState(
  direction: string,
  gameState: GameState,
  remainingMaxEvaluations: number
): { futureState: GameState; stateScore: number } {
  trace(
    `   evaluateFutureGameState  depth = ${remainingMaxEvaluations}, direction = ${direction}`
  );
  const futureState = gameStateAfterThisMove(direction, gameState);
  // TODO calculate future state just updating me
  if (remainingMaxEvaluations == 0) {
    const score = scoreGameState(futureState);
    trace(
      `       gamescore = ${score}   - depth = ${remainingMaxEvaluations}, direction = ${direction}`
    );
    return {
      futureState: futureState,
      stateScore: score,
    };
  } else {
    const { safe, risky, appeal } = moveEvaluator(futureState);
    const takeNorisk = true;
    const bestMoves = returnBestMovesList(safe, appeal, risky, takeNorisk);

    if (bestMoves.length === 0) {
      trace(
        `     number of futures is 0, depth = ${remainingMaxEvaluations}, score = ${DEATH_SCORE}`
      );
      return {
        futureState: futureState,
        stateScore: DEATH_SCORE,
      };
    }
    const futureStates = evaluateFutureGameStates(
      bestMoves,
      futureState,
      remainingMaxEvaluations - 1
    );
    const totalScore = Object.keys(futureStates)
      .map((key) => futureStates[key].stateScore)
      .reduce((accumulator, currentValue) => accumulator + currentValue);
    const numberOfViableFuture = Object.keys(futureStates).length;
    trace(
      `      depth = ${remainingMaxEvaluations}, number of futures = ${numberOfViableFuture}, score = ${totalScore}`
    );
    return {
      futureState: futureState,
      stateScore: totalScore,
    };
  }
}

export function evaluateFutureGameStates(
  directions: string[],
  gameState: GameState,
  remainingMaxEvaluations: number
): { [direction: string]: { futureState: GameState; stateScore: number } } {
  trace(
    ` evaluateFutureGameStates : depth = ${remainingMaxEvaluations}, directions = ${JSON.stringify(
      directions
    )}`
  );
  const states: {
    [direction: string]: { futureState: GameState; stateScore: number };
  } = {};
  for (let i = 0; i < directions.length; i++) {
    states[directions[i]] = evaluateFutureGameState(
      directions[i],
      gameState,
      remainingMaxEvaluations
    );
  }
  return states;
}

const MAX_EVALUATION_DEPTH = 1;

export function move(gameState: GameState): MoveResponse {
  trace("\n === start Move ===");
  console.log(JSON.stringify(gameState));
  const { safe, risky, appeal } = moveEvaluator(gameState);
  const bestMoves = returnBestMovesList(safe, appeal, risky);

  const futureStates = evaluateFutureGameStates(
    bestMoves,
    gameState,
    MAX_EVALUATION_DEPTH
  );

  trace(`Future state global result = ${JSON.stringify(futureStates)}`);

  const response: MoveResponse = {
    move: bestMoves[Math.floor(Math.random() * bestMoves.length)],
  };

  trace(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
  return response;
}

export function moveEvaluator(gameState: GameState): {
  safe: string[];
  risky: ScoredDirection;
  appeal: ScoredDirection;
} {
  let possibleMoves: { [key: string]: boolean } = {
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
  let appealingMoves = new ScoredDirection();
  for (let i = 0; i < gameState.board.snakes.length; i++) {
    if (gameState.board.snakes[i].id == gameState.you.id) {
      continue;
    }
    avoidSnakeBody(gameState.board.snakes[i].body, myHead, possibleMoves);
    headColisionDesision(
      gameState.board.snakes[i].head,
      gameState.board.snakes[i].length,
      myHead,
      gameState.you.length,
      possibleMoves,
      riskyMoves,
      appealingMoves
    );
  }
  // trace(`Possible moves = ${JSON.stringify(possibleMoves)}`);

  // TODO: Step 4 - Find food.
  // Use information in gameState to seek out and find food.
  // trace(" ===== Step 4 - Find food =====");
  // TODO: Bonus for food could depend of how hungry
  for (let i = 0; i < gameState.board.food.length; i++) {
    if (myHead.y == gameState.board.food[i].y) {
      if (myHead.x == gameState.board.food[i].x - 1 && possibleMoves.right) {
        // trace("There is food on the right and it is safe");
        appealingMoves.addScore("right", FOOD_MAX_BONUS);
      } else if (
        myHead.x == gameState.board.food[i].x + 1 &&
        possibleMoves.left
      ) {
        // trace("There is food on the left and it is safe");
        appealingMoves.addScore("left", FOOD_MAX_BONUS);
      }
    } else if (myHead.x == gameState.board.food[i].x) {
      if (myHead.y == gameState.board.food[i].y - 1 && possibleMoves.up) {
        // trace("There is food on the up and it is safe");
        appealingMoves.addScore("up", FOOD_MAX_BONUS);
      } else if (
        myHead.y == gameState.board.food[i].y + 1 &&
        possibleMoves.down
      ) {
        // trace("There is food on the down and it is safe");
        appealingMoves.addScore("down", FOOD_MAX_BONUS);
      }
    }
  }

  // Finally, choose a move from the available safe moves.
  // TODO: Step 5 - Select a move to make based on strategy, rather than random.
  // trace(" ===== Step 5 - Choose a move =====");
  const safeMoves = Object.keys(possibleMoves).filter(
    (key) => possibleMoves[key]
  );
  return { safe: safeMoves, appeal: appealingMoves, risky: riskyMoves };
}

function returnBestMovesList(
  safeMoves: string[],
  appealingMoves: ScoredDirection,
  riskyMoves: ScoredDirection,
  takeNorisk: boolean = false
): string[] {
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

  const maxAppealingDirections = appealingMoves.getMaxAmongTheseDirections(
    directionWorthExploring
  );
  // trace(`maxAppealingDirections = ${JSON.stringify(maxAppealingDirections)}`);
  if (maxAppealingDirections.length === 0) {
    /* trace(
      `No possible move are appealing returning safeMoves ${JSON.stringify(
        safeMoves
      )}`
    );*/
    return safeMoves;
  }
  // trace(`bestMoves = ${JSON.stringify(maxAppealingDirections)}`);
  return maxAppealingDirections;
}
