import { GameState, MoveResponse } from "../types";

import {
  findNextMove,
  returnBestMovesList,
} from "./SingleMoveEvaluator";
import { evaluateDirections } from "./FutureExplorer";
import { trace, logLevel as log } from "../logger";
import { findMyIndex } from "./utils";

export function move(gameState: GameState): MoveResponse {
  let startTime = new Date().getTime();
  trace(log.WARN, `=== start Move === turn ${gameState.turn} ===\n`);

  // Critical step we validate the index of my snake
  const indexOfMySnake = findMyIndex(gameState);

  const { safe, risky } = findNextMove(gameState.board, indexOfMySnake);
  const bestMoves = returnBestMovesList(safe, risky);

  const directionScores = evaluateDirections(
    bestMoves,
    gameState.board,
    startTime,
    indexOfMySnake
  );
  trace(log.INFO, `Future state global result:`);
  let maximum: number;
  Object.keys(directionScores).map((key) => {
    const score = directionScores[key].score;
    if (maximum === undefined || maximum < score) {
      maximum = score;
    }
    trace(log.INFO, `${key}:  ${score}`, 2);
  });

  const bestDirections = Object.keys(directionScores)
    .filter((key) => directionScores[key].score == maximum)
    .map((key) => key);

  trace(log.INFO, `Overall bestDirections = ${JSON.stringify(bestDirections)}`);

  const response: MoveResponse = {
    move: bestDirections[Math.floor(Math.random() * bestDirections.length)],
  };

  let endTime = new Date().getTime();
  let time = endTime - startTime;
  trace(
    log.WARN,
    `${gameState.game.id} MOVE ${gameState.turn}: ${response.move} [${time} ms]`
  );
  return response;
}
