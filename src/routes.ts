import {
  InfoResponse,
  GameState,
  MoveResponse,
} from "./types";

import { findNextMove, returnBestMovesList } from "./SingleMoveEvaluator";

import { evaluateFutureGameStates } from "./FutureExplorer";

import { trace, logLevel as log } from "./logger";

import { MAX_EVALUATION_DEPTH } from "./constants";

export function info(): InfoResponse {
  trace(log.INFO, "INFO");
  const response: InfoResponse = {
    apiversion: "1",
    author: "Gabriel",
    color: "#4ACB7C",
    head: "pixel",
    tail: "pixel",
  };
  return response;
}

export function start(gameState: GameState): void {
  console.log(` START https://engine.battlesnake.com/games/${gameState.game.id}/frames`);
}

export function end(gameState: GameState): void {
  trace(log.INFO, `${gameState.game.id} END\n`);
}

export function move(gameState: GameState): MoveResponse {

  trace(log.WARN, `=== start Move === turn ${gameState.turn} ===\n`);

  const { safe, risky } = findNextMove(gameState);
  const bestMoves = returnBestMovesList(safe, risky);

  const futureStates = evaluateFutureGameStates(
    new Array(),
    bestMoves,
    gameState,
    MAX_EVALUATION_DEPTH
  );

  trace(log.INFO, `Future state global result:`);
  let maximum: number | undefined;
  Object.keys(futureStates).map(key => {
    if (maximum === undefined || maximum < futureStates[key].stateScore) {
      maximum = futureStates[key].stateScore;
    }
    trace(log.INFO,`${key}:  ${futureStates[key].stateScore}`, 2)});

  const bestDirections = Object.keys(futureStates).filter((key) => futureStates[key].stateScore == maximum).map(key => key);

  trace(log.INFO,`Overall bestDirections = ${JSON.stringify(bestDirections)}`);

  const response: MoveResponse = {
    move: bestDirections[Math.floor(Math.random() * bestDirections.length)],
  };

  trace(log.WARN,
    `${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`
  );
  return response;
}
