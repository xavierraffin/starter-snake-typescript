import { Board, Direction, BoardStatus } from "../types";

import { DEATH_SCORE, MAX_COMPUTING_TIME_MS } from "./constants";
import { scoreBoardState } from "./GameScoreEvaluator";
import { boardAfterThisMove } from "./GameSimulator";
import { returnBestMovesList, findNextMove } from "./SingleMoveEvaluator";
import { trace, logLevel as log } from "../logger";
import { possibleEnemiesMoves } from "./EnemyMoveEvaluator";

const fileLogLevel = log.INFO;

enum AccumulatorLeaveType {
  ENEMY,
  PLAYER,
}

abstract class AccumulatorLeave {
  board: Board;
  childs: AccumulatorLeave[];
  type: AccumulatorLeaveType;
  constructor(board: Board, type: AccumulatorLeaveType) {
    this.board = board;
    this.childs = new Array();
    this.type = type;
  }
}

class EnemyLeave extends AccumulatorLeave {
  public depth: number;
  public directionHistory: Direction[];
  private direction: Direction;
  private myIndex?: number;
  private winNumbers?: number;
  private snakeKillOppty?: number;
  private nbBoards?: number;
  constructor(pastDirections: Direction[], direction: Direction, board: Board) {
    super(JSON.parse(JSON.stringify(board)), AccumulatorLeaveType.ENEMY);
    this.directionHistory = pastDirections.slice();
    this.directionHistory.push(direction);
    this.direction = direction;
    this.depth = this.directionHistory.length;
    trace(log.DEBUG, `Create EnemyLeave ${this.directionHistory}`, this.depth);
  }
  public reduceScoreToMinOfChilds(maxDepth: number): number {
    if (this.depth === maxDepth) {
      const score = scoreBoardState(
        this.board,
        this.myIndex!,
        this.winNumbers!,
        this.snakeKillOppty!,
        this.nbBoards!
      );
      trace(
        log.INFO,
        `Direction ${this.directionHistory} get score ${score}`,
        this.depth
      );
      return score;
    }
    trace(
      log.DEBUG,
      `Direction ${this.directionHistory} depth=${this.depth}<${maxDepth} getting min of childs`,
      this.depth
    );
    let minimumScore: number = 1000000;
    if (this.childs.length === 0) {
      trace(
        log.WARN,
        `This move has no child ${
          this.directionHistory
        } this may be a dead end board=${JSON.stringify(this.board)}`,
        this.depth
      );
    }
    this.childs.forEach((child) => {
      const score = (child as PlayerLeave).reduceScoreToMaxOfChilds(maxDepth);
      if (minimumScore === undefined || score < minimumScore) {
        minimumScore = score;
      }
    });
    trace(
      log.DEBUG,
      `Direction ${this.directionHistory} get score ${minimumScore}`,
      this.depth
    );
    return minimumScore;
  }
  public evaluateScoreAndReturnPossibleNextBoards(myIndex: number): {
    possibleNextBoards: BoardStatus[];
    sureWin: boolean;
  } {
    trace(log.DEBUG, `Evaluating possible enemy move after ${this.directionHistory}`, this.depth);
    // Player move without knowing the other moves so it has to happen first
    const playerMoveResolution = boardAfterThisMove(
      this.direction,
      this.board,
      myIndex
    );
    if (playerMoveResolution.snakeStarved) {
      // Death by starvation, no need to calculate snakes moves
      return { possibleNextBoards: [], sureWin: false };
    }
    const { winNumbers, snakeKillOppty, sureWin, boardStatus } =
      possibleEnemiesMoves(this.board, myIndex);
    if (sureWin) {
      trace(
        log.WARN,
        `We have a sure win!!! Stop everything and do ${JSON.stringify(
          this.directionHistory
        )}`
      );
      return { possibleNextBoards: [], sureWin: true };
    }
    this.myIndex = myIndex;
    this.winNumbers = winNumbers;
    this.snakeKillOppty = snakeKillOppty;
    this.nbBoards = boardStatus.length;
    return { possibleNextBoards: boardStatus, sureWin: false };
  }
}
class PlayerLeave extends AccumulatorLeave {
  public parent: EnemyLeave;
  constructor(board: Board, parent: EnemyLeave) {
    super(board, AccumulatorLeaveType.PLAYER);
    this.parent = parent;
    trace(log.DEBUG, `Create PlayerLeave from ${this.parent.directionHistory}`, this.parent.depth);
  }
  public possibleNextDirections(myIndex: number): Direction[] {
    trace(
      log.DEBUG,
      `>>> After ${this.parent.directionHistory}, board=${JSON.stringify(
        this.board
      )}`,
      this.parent.depth
    );
    const { safe, risky } = findNextMove(this.board, myIndex);
    trace(log.DEBUG, `>>>>> safe = ${safe}`, this.parent.depth);
    const takeNorisk = true;
    const direct = returnBestMovesList(safe, risky, takeNorisk);
    trace(
      log.DEBUG,
      `>>>>> Best move ${direct}`,
      this.parent.depth
    );
    return direct;
  }
  public reduceScoreToMaxOfChilds(maxDepth: number): number {
      trace(
        log.INFO,
        `PlayerLeave Direction ${this.parent.directionHistory} - reduceScoreToMaxOfChilds`,
        this.parent.depth
      );
    let maximumScore: number = -1000000;
    if (this.childs.length === 0) {
      maximumScore = DEATH_SCORE;
    } else
      this.childs.forEach((child) => {
        const score = (child as EnemyLeave).reduceScoreToMinOfChilds(maxDepth);
        if (maximumScore === undefined || score > maximumScore) {
          maximumScore = score;
        }
      });
    return maximumScore;
  }
}

const MAX_DEPTH = 2;

export function evaluateDirections(
  directions: Direction[],
  board: Board,
  startTime: number,
  myIndex: number
): { [direction: string]: { score: number } } {
  let currentDepth = 0;
  const accumulator: AccumulatorLeave[] = [];

  trace(
    log.DEBUG,
    `Begin evaluateDirections with directions ${directions}`
  );

  const root: {
    [direction: string]: { leave: EnemyLeave; score: number };
  } = {};

  directions.forEach((direction) => {
    const boardCopy = JSON.parse(JSON.stringify(board));
    const firstLeave = new EnemyLeave([], direction, boardCopy);
    accumulator.push(firstLeave);
    root[direction] = {
      leave: firstLeave,
      score: 0,
    };
  });

  // Exploration phase
  while (accumulator.length > 0) {
    const leave: AccumulatorLeave = accumulator.shift()!;
    if (leave.type == AccumulatorLeaveType.PLAYER) {
      const playerLeave: PlayerLeave = leave as PlayerLeave;
      const parentLeave: EnemyLeave = playerLeave.parent;
      if (parentLeave.depth > currentDepth || parentLeave.depth == MAX_DEPTH) {
        let timeSpent = new Date().getTime() - startTime;
        if (
          timeSpent >= MAX_COMPUTING_TIME_MS ||
          parentLeave.depth == MAX_DEPTH
        ) {
          trace(
            log.WARN,
            `We reached max depth of ${parentLeave.depth}, time spent = ${timeSpent}ms, stopping evaluation`
          );
          break; // quit the while loop
        } else {
          currentDepth = parentLeave.depth;
          trace(
            log.DEBUG,
            `We are reaching a new depth ${currentDepth}, but we have time to explore more [${timeSpent}ms]`
          );
        }
      }
      const possibleNextDirections: Direction[] = playerLeave.possibleNextDirections(myIndex);
      trace(
        log.DEBUG,
        `PlayerLeave: possibleNextDirections ${possibleNextDirections}`
      );
      possibleNextDirections.forEach((direction) => {
        const newEnemyLeave = new EnemyLeave(
          parentLeave.directionHistory,
          direction,
          playerLeave.board
        );
        accumulator.push(newEnemyLeave);
        playerLeave.childs.push(newEnemyLeave);
      });
    } else {
      // AccumulatorLeaveType.ENEMY
      const enemyLeave: EnemyLeave = leave as EnemyLeave;
      const { possibleNextBoards, sureWin } = enemyLeave.evaluateScoreAndReturnPossibleNextBoards(
        myIndex
      );
      trace(
        log.DEBUG,
        `EnemyLeave: number of boards=${possibleNextBoards.length}`
      );
      if (sureWin) {
        // This is a sure win, we stop any calculation and return only one direction, the one at the origin of the win
        const bestDirection: { [direction: string]: { score: number } } = {};
        bestDirection[enemyLeave.directionHistory[0]] = {
          score: 100,
        };
        trace(
          log.WARN,
          `There is a sure win on ${enemyLeave.directionHistory} we return immediatly the direction ${enemyLeave.directionHistory[0]}`
        );
        return bestDirection;
      }
      possibleNextBoards.forEach((boardStatus) => {
        const newPlayerLeave = new PlayerLeave(boardStatus.board, enemyLeave);
        accumulator.push(newPlayerLeave);
        enemyLeave.childs.push(newPlayerLeave);
      });
    }
  }
  
  // Reduction phase
  trace(log.VERBOSE, ` === Now calculating scores ===`);
  Object.keys(root).map((key) => {
    root[key].score += root[key].leave.reduceScoreToMinOfChilds(currentDepth+1);
  });

  return root as { [direction: string]: { score: number } };
}
