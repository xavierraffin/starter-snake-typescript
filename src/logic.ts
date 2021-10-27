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
        trace("There is a body on the up");
        possibleMoves.up = false;
      } else if (body[i].y == myhead.y - 1) {
        trace("There is a body on the down");
        possibleMoves.down = false;
      }
    }
    if (body[i].y == myhead.y) {
      if (body[i].x == myhead.x + 1) {
        trace("There is a body on the right");
        possibleMoves.right = false;
      } else if (body[i].x == myhead.x - 1) {
        trace("There is a body on the left");
        possibleMoves.left = false;
      }
    }
  }
}

function isOnThisSide(snakeHead: any, myhead: any, direction: string): boolean {
  trace(
    `Evaluate if [${snakeHead.x},${snakeHead.y}] is on my ${direction} : between me [${myhead.x},${myhead.y}]`
  );
  switch (direction) {
    case "up":
      if (
        (snakeHead.x == myhead.x && snakeHead.y + 2 == myhead.y) ||
        (snakeHead.x == myhead.x - 1 && snakeHead.y + 1 == myhead.y) ||
        (snakeHead.x == myhead.x + 1 && snakeHead.y + 1 == myhead.y)
      ) {
        return true;
      }
    case "down":
      if (
        (snakeHead.x == myhead.x && snakeHead.y - 2 == myhead.y) ||
        (snakeHead.x == myhead.x - 1 && snakeHead.y - 1 == myhead.y) ||
        (snakeHead.x == myhead.x + 1 && snakeHead.y - 1 == myhead.y)
      ) {
        return true;
      }
    case "right":
      if (
        (snakeHead.y == myhead.y && snakeHead.x + 2 == myhead.x) ||
        (snakeHead.y == myhead.y - 1 && snakeHead.x + 1 == myhead.x) ||
        (snakeHead.y == myhead.y + 1 && snakeHead.x + 1 == myhead.x)
      ) {
        return true;
      }
    case "left":
      if (
        (snakeHead.y == myhead.y && snakeHead.x - 2 == myhead.x) ||
        (snakeHead.y == myhead.y - 1 && snakeHead.x - 1 == myhead.x) ||
        (snakeHead.y == myhead.y + 1 && snakeHead.x - 1 == myhead.x)
      ) {
        return true;
      }
  }
  return false;
}

function headColisionDesision(
  enemyHead: any,
  enemyLength: number,
  myhead: any,
  myLength: number,
  possibleMoves: any
): void {
  trace(
    `Evaluate collision between me ${myLength} : [${myhead.x},${myhead.y}] and enemy of length ${enemyLength} at [${enemyHead.x},${enemyHead.y}]`
  );
  const safeMoves = Object.keys(possibleMoves).filter(
    (key) => possibleMoves[key]
  );
  for (let j = 0; j < safeMoves.length; j++) {
    if (isOnThisSide(enemyHead, myhead, safeMoves[j])) {
      if (enemyLength >= myLength) {
        trace(`There a potential deadly collision head on the ${safeMoves[j]}`);
        possibleMoves[safeMoves[j]] = false;
      } else {
        trace(`There a potential safe kill collision on the ${safeMoves[j]}`);
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

export function move(gameState: GameState): MoveResponse {
  let possibleMoves: { [key: string]: boolean } = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  trace(" === start Move ===");

  // Step 0: Don't let your Battlesnake move back on it's own neck
  const myHead = gameState.you.head;
  const myNeck = gameState.you.body[1];
  if (myNeck.x < myHead.x) {
    trace("I am coming from left");
    possibleMoves.left = false;
  } else if (myNeck.x > myHead.x) {
    trace("I am coming from right");
    possibleMoves.right = false;
  } else if (myNeck.y < myHead.y) {
    trace("I am coming from down");
    possibleMoves.down = false;
  } else if (myNeck.y > myHead.y) {
    trace("I am coming from up");
    possibleMoves.up = false;
  }

  // TODO: Step 1 - Don't hit walls.
  // Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
  if (myHead.x == gameState.board.width - 1) {
    trace("There is a wall on the right");
    possibleMoves.right = false;
  }
  if (myHead.x == 0) {
    trace("There is a wall on the left");
    possibleMoves.left = false;
  }
  if (myHead.y == 0) {
    trace("There is a wall on the down");
    possibleMoves.down = false;
  }
  if (myHead.y == gameState.board.height - 1) {
    trace("There is a wall on the up");
    possibleMoves.up = false;
  }
  trace(`Possible moves = ${JSON.stringify(possibleMoves)}`);

  // TODO: Step 2 - Don't hit yourself.
  // Use information in gameState to prevent your Battlesnake from colliding with itself.

  trace(" ===== Step 2 - Don't hit yourself =====");
  const mybody = gameState.you.body;
  avoidSnakeBody(mybody, myHead, possibleMoves);
  trace(`Possible moves = ${JSON.stringify(possibleMoves)}`);

  // TODO: Step 3 - Don't collide with others.
  // Use information in gameState to prevent your Battlesnake from colliding with others.
  trace(" ===== Step 3 - Don't collide with others =====");
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
      possibleMoves
    );
  }
  trace(`Possible moves = ${JSON.stringify(possibleMoves)}`);

  // TODO: Step 4 - Find food.
  // Use information in gameState to seek out and find food.
  trace(" ===== Step 4 - Find food =====");
  for (let i = 0; i < gameState.board.food.length; i++) {
    if (myHead.y == gameState.board.food[i].y) {
      if (myHead.x == gameState.board.food[i].x - 1 && possibleMoves.right) {
        trace("There is food on the right and it is safe");
        possibleMoves.up = false;
        possibleMoves.down = false;
      } else if (
        myHead.x == gameState.board.food[i].x + 1 &&
        possibleMoves.left
      ) {
        trace("There is food on the left and it is safe");
        possibleMoves.up = false;
        possibleMoves.down = false;
      }
    } else if (myHead.x == gameState.board.food[i].x) {
      if (myHead.y == gameState.board.food[i].y - 1 && possibleMoves.up) {
        trace("There is food on the up and it is safe");
        possibleMoves.left = false;
        possibleMoves.right = false;
      } else if (
        myHead.y == gameState.board.food[i].y + 1 &&
        possibleMoves.down
      ) {
        trace("There is food on the up and it down safe");
        possibleMoves.left = false;
        possibleMoves.right = false;
      }
    }
  }

  // Finally, choose a move from the available safe moves.
  // TODO: Step 5 - Select a move to make based on strategy, rather than random.
  trace(" ===== Step 5 - Choose a move =====");
  trace(`Possible moves = ${JSON.stringify(possibleMoves)}`);
  const safeMoves = Object.keys(possibleMoves).filter(
    (key) => possibleMoves[key]
  );
  const response: MoveResponse = {
    move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
  };

  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
  return response;
}
