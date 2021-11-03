import { GameState, MoveResponse } from "../types";

import {
  findNextMove,
  returnBestMovesList,
} from "./SingleMoveEvaluator";
import { evaluateFutureGameStates } from "./FutureExplorer";
import { trace, logLevel as log, setGameId } from "../logger";
import { DEATH_SCORE, MAX_EVALUATION_DEPTH } from "./constants";

export function move(gameState: GameState): MoveResponse {
  setGameId(`${gameState.game.id}-${gameState.turn}`);
  trace(
    log.WARN,
    `=== start Move === turn ${gameState.turn} ===\n`
  );

  trace(log.WARN, `gameState = ${JSON.stringify(gameState)}\n`);

  const { safe, risky } = findNextMove(gameState);
  const bestMoves = returnBestMovesList(safe, risky);

  trace(log.DEBUG, `safe ${safe} - risky ${JSON.stringify(risky)}\n`);

  const futureStates = evaluateFutureGameStates(
    new Array(),
    bestMoves,
    gameState,
    MAX_EVALUATION_DEPTH
  );

  trace(log.INFO, `Future state global result:`);
  let maximum: number | undefined;
  Object.keys(futureStates).map((key) => {
    if (maximum === undefined || maximum < futureStates[key].stateScore) {
      maximum = futureStates[key].stateScore;
    }
    trace(log.INFO, `${key}:  ${futureStates[key].stateScore}`, 2);
  });

  const bestDirections = Object.keys(futureStates)
    .filter((key) => futureStates[key].stateScore == maximum)
    .map((key) => key);

  trace(log.INFO, `Overall bestDirections = ${JSON.stringify(bestDirections)}`);

   let directionSelection = bestDirections;

  if (maximum === undefined || maximum <= DEATH_SCORE + 500) {
    trace(
      log.WARN,
      `We are going to a certain death in ${directionSelection}`
    );
    const moveMaybeRIskyButNotDeadly = safe.filter(
      (value) => !bestDirections.includes(value)
    );
    if (moveMaybeRIskyButNotDeadly.length>0) {
      directionSelection = moveMaybeRIskyButNotDeadly;
      trace(
        log.WARN,
        `Let's try a riskier option in ${directionSelection} instead`
      );
    }
  }
    const response: MoveResponse = {
      move: directionSelection[Math.floor(Math.random() * directionSelection.length)],
    };

  trace(
    log.WARN,
    `${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`
  );
  return response;
}
