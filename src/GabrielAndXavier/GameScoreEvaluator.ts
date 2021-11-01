import { Board } from "../types";
import {
  START_NUMBER_OF_SNAKES,
  DEATH_SCORE,
} from "./constants";
import { trace, logLevel as log } from "../logger";
import { ModuleResolutionKind } from "typescript";

export function scoreBoardState(
  board: Board,
  myIndex: number,
  winNumber: number,
  snakeSureKills: number,
  numberOfEnemyMoves: number
) {

  const health = board.snakes[myIndex].health;
  const numberOfenemies = board.snakes.length - 1;
  
  let lowMovesForOpponents: boolean = false;
  let snakeKillBonusRatio: number = 1;
  switch(numberOfenemies){
    case(8):
    case(7):
    case(6):
    case(5):
      lowMovesForOpponents = numberOfEnemyMoves <= 10;
      break;
    case(4):
      lowMovesForOpponents = numberOfEnemyMoves <= 6;
      snakeKillBonusRatio = 0.1;
      break;
    case(3):
      lowMovesForOpponents = numberOfEnemyMoves <= 4;
      snakeKillBonusRatio = 0.5;
      break;
    case(2):
      lowMovesForOpponents = numberOfEnemyMoves <= 2;
      snakeKillBonusRatio = 1;
      break;
    case(1):
      lowMovesForOpponents = numberOfEnemyMoves == 1;
      snakeKillBonusRatio = 10;
  }
  
  let winRatio = winNumber/(numberOfEnemyMoves+winNumber);
  if(winRatio<0.85){
    winRatio = 0;
  }

  let score: number;
  if(health > 75){
    score = health + snakeSureKills * 100 * snakeKillBonusRatio + winRatio * 50;
    if(lowMovesForOpponents){
      score += 100;
    }
  } else if (health > 50) {
    score = health + snakeSureKills * 80 * snakeKillBonusRatio + winRatio * 25;
    if(lowMovesForOpponents){
      score += 50;
    }
  } else if (health > 25) {
    score = health + snakeSureKills * 50 * snakeKillBonusRatio + winRatio * 20;
    if(lowMovesForOpponents){
      score += 20;
    }
  } else if (health > 15) {
    score = health + snakeSureKills * 20 * snakeKillBonusRatio;
    if(lowMovesForOpponents){
      score += 10;
    }
  } else if (health > 5) {
    score = health + snakeSureKills * 10 * snakeKillBonusRatio;
  } else {
    score = health;
  }

  if (health === 0) {
    return DEATH_SCORE;
  }

  trace(
    log.DEBUG,
    `SCORE: ${score} health=${health}, nbSnake=s${numberOfenemies}, winRatio=${winRatio}, lowMovesForOpponents=${lowMovesForOpponents}, numberOfEnemyMoves=${numberOfEnemyMoves}`
  );
  return score;
}
