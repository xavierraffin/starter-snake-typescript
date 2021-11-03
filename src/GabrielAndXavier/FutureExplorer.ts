import {
  GameState,
  Direction,
} from "../types";

import { DEATH_SCORE, MAX_EVALUATION_DEPTH } from "./constants";
import { scoreGameState } from "./GameScoreEvaluator";
import { gameStateAfterThisMove } from "./GameSimulator";
import { returnBestMovesList, findNextMove } from "./SingleMoveEvaluator";
import { trace, logLevel as log } from "../logger";

const fileLogLevel = log.INFO;

export function evaluateFutureGameState(
  directionHistory: string[],
  direction: Direction,
  gameState: GameState,
  remainingMaxEvaluations: number
): { futureState: GameState; stateScore: number } {
  const indent = MAX_EVALUATION_DEPTH - remainingMaxEvaluations;
  trace(
    fileLogLevel,
    `evaluateFuture direction = ${JSON.stringify(
      direction
    )}, history = ${JSON.stringify(directionHistory)}`,
    indent
  );
  const response = gameStateAfterThisMove(direction, gameState);
  // TODO: here
  // Move all snakes in every direction except backward (and body direct colision + wall colision?)
  // Then add a recursion level
  const futureState = response.gamestate!;
  if (response.snakeDied) {
    return {
      futureState: futureState,
      stateScore: DEATH_SCORE,
    };
  }

  if (remainingMaxEvaluations == 0) {
    const score = scoreGameState(futureState);
    trace(fileLogLevel, `gamescore = ${score}`, indent);
    return {
      futureState: futureState,
      stateScore: score,
    };
  } else {
    const { safe, risky } = findNextMove(futureState);
    const takeNorisk = true;
    const bestMoves = returnBestMovesList(safe, risky, takeNorisk);

    trace(
      fileLogLevel,
      `On this state, safe = ${JSON.stringify(safe)}, risky = ${JSON.stringify(
        risky
      )}}`,
      indent
    );

    if (safe.length === 0) {
      trace(
        fileLogLevel,
        `number of safe moves is 0, DEATH gamescore = ${DEATH_SCORE}`,
        indent
      );
      return {
        futureState: futureState,
        stateScore: DEATH_SCORE,
      };
    }
    const futureStates = evaluateFutureGameStates(
      directionHistory,
      bestMoves,
      futureState,
      remainingMaxEvaluations - 1
    );
    // If a future is a sure death we remove it from exploration
    const nonFatalFutures = Object.keys(futureStates).filter(
      (key) => futureStates[key].stateScore !== DEATH_SCORE
    );
    const numberOfViableFuture = Object.keys(nonFatalFutures).length;
    if (numberOfViableFuture === 0) {
      trace(
        fileLogLevel,
        `number of nonFatalFutures is 0, DEATH??? gamescore = ${DEATH_SCORE}`,
        indent
      );
      return {
        futureState: futureState,
        stateScore: DEATH_SCORE,
      };
    }

    const maximumScore = nonFatalFutures
      .map((key) => futureStates[key].stateScore)
      .reduce((accumulator, currentValue) => 
        currentValue > accumulator ? currentValue : accumulator
      );

    /*const totalScore = nonFatalFutures
      .map((key) => futureStates[key].stateScore)
      .reduce((accumulator, currentValue) => accumulator + currentValue);*/
    let totalScore = numberOfViableFuture * 2 + maximumScore;
    if (futureState.you.health < 20){
      const score = scoreGameState(futureState);
      totalScore += (score * (1 + MAX_EVALUATION_DEPTH - remainingMaxEvaluations) / 8);
    }

    trace(
      fileLogLevel,
      `number of futures = ${numberOfViableFuture}, totalScore = ${totalScore} maxScore ${maximumScore}`,
      indent
    );
    return {
      futureState: futureState,
      stateScore: totalScore,
    };
  }
}

export function evaluateFutureGameStates(
  directionHistory: string[],
  directions: string[],
  gameState: GameState,
  remainingMaxEvaluations: number
): { [direction: string]: { futureState: GameState; stateScore: number } } {
  const indent = MAX_EVALUATION_DEPTH - remainingMaxEvaluations;
  trace(
    fileLogLevel,
    `evaluateFutureGameStates : depth = ${remainingMaxEvaluations}, directions = ${JSON.stringify(
      directions
    )} - history = ${JSON.stringify(directionHistory)}`,
    indent
  );
  const states: {
    [direction: string]: { futureState: GameState; stateScore: number };
  } = {};
  for (let i = 0; i < directions.length; i++) {
    const newHistory = directionHistory.slice();
    newHistory.push(directions[i]);
    states[directions[i]] = evaluateFutureGameState(
      newHistory,
      directions[i] as Direction,
      gameState,
      remainingMaxEvaluations
    );
  }
  return states;
}
