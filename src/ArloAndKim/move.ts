import { trace, logLevel as log } from "../logger";
import { GameState, MoveResponse } from "../types";

export function move(gameState: GameState): MoveResponse {

    trace(log.INFO, ` === move Arlo snake ===`);

    let possibleMoves: { [key: string]: boolean } = {
      up: true,
      down: true,
      left: true,
      right: true,
    };

    // Step 0: Don't let your Battlesnake move back on it's own neck
    const myHead = gameState.you.head;
    const myNeck = gameState.you.body[1];
    if (myNeck.x < myHead.x) {
      possibleMoves.left = false;
    } else if (myNeck.x > myHead.x) {
      possibleMoves.right = false;
    } else if (myNeck.y < myHead.y) {
      possibleMoves.down = false;
    } else if (myNeck.y > myHead.y) {
      possibleMoves.up = false;
    }

    // TODO: Step 1 - Don't hit walls.
    // Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
    // const boardWidth = gameState.board.width
    // const boardHeight = gameState.board.height

    // TODO: Step 2 - Don't hit yourself.
    // Use information in gameState to prevent your Battlesnake from colliding with itself.
    // const mybody = gameState.you.body

    // TODO: Step 3 - Don't collide with others.
    // Use information in gameState to prevent your Battlesnake from colliding with others.

    // TODO: Step 4 - Find food.
    // Use information in gameState to seek out and find food.

    // Finally, choose a move from the available safe moves.
    // TODO: Step 5 - Select a move to make based on strategy, rather than random.
    const safeMoves = Object.keys(possibleMoves).filter(
      (key) => possibleMoves[key]
    );
    const response: MoveResponse = {
      move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
    };

    trace(
      log.INFO,
      `${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`
    );
    return response;
}