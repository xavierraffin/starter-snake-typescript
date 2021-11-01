
import { Board, Direction, MoveInfo, BoardStatus } from "../types";

import { findNextMove } from "./SingleMoveEvaluator";
import { boardAfterEnemiesMove } from "./GameSimulator";
import { trace, logLevel as log } from "../logger";

let globalIndexInfo: number;
class SnakeMove implements MoveInfo {
  public snakeIndex: number;
  public direction: Direction;
  public childs: SnakeMove[];
  constructor(info: MoveInfo) {
    this.snakeIndex = info.snakeIndex;
    this.direction = info.direction;
    this.childs = new Array();
  }
  addLeaf(mvInfo: MoveInfo) {
    trace(log.DEBUG, `Adding SnakeMove leaf = ${JSON.stringify(mvInfo)}`);
    if (
      this.childs.length === 0 ||
      this.childs[0].snakeIndex === mvInfo.snakeIndex
    ) {
      this.childs.push(new SnakeMove(mvInfo));
    } else {
      this.childs.forEach((move) => {
        move.addLeaf(mvInfo);
      });
    }
  }
  findAllFinalMoves(
    previousSnakeMoves: MoveInfo[],
    referenceBoard: Board,
    newBoardStatuses: BoardStatus[]
  ) {
    const currentMoves = previousSnakeMoves.slice();
    if (this.snakeIndex !== globalIndexInfo) {
      currentMoves.push({
        snakeIndex: this.snakeIndex,
        direction: this.direction,
      });
    }
    if (this.childs.length === 0) {
      const boardCopy = JSON.parse(JSON.stringify(referenceBoard));
      newBoardStatuses.push(
        boardAfterEnemiesMove(currentMoves, boardCopy, globalIndexInfo)
      );
    } else {
      this.childs.forEach((move) => {
        move.findAllFinalMoves(currentMoves, referenceBoard, newBoardStatuses);
      });
    }
    trace(log.DEBUG, `findAllFinalMoves = ${JSON.stringify(currentMoves)}`);
  }
}

export function possibleEnemiesMoves(
  board: Board,
  myIndex: number
): {
  winNumbers: number;
  sureWin: boolean;
  snakeKillOppty: number;
  boardStatus: BoardStatus[];
} {
  globalIndexInfo = myIndex;
  const snakes = board.snakes;
  const root: SnakeMove = new SnakeMove({
    snakeIndex: myIndex,
    direction: Direction.UP, // the root tree direction is never read and therefore arbitrary
  });
  trace(
    log.DEBUG,
    `Start enemy moves board = ${JSON.stringify(board)}`
  );
  for (let i = 0; i < snakes.length; i++) {
    if (i === myIndex) {
      continue;
    }
    // TODO if calling a simplified version that do not calculate risky is fater
    const { safe, risky } = findNextMove(board, i);
    for (let j = 0; j < safe.length; j++) {
      root.addLeaf({
        snakeIndex: i,
        direction: safe[j],
      });
    }
  }

  const newBoards: BoardStatus[] = new Array();
  root.findAllFinalMoves([], board, newBoards);

  trace(log.DEBUG, `I found ${newBoards.length} possible states`);

  let sureKill = true;
  let winNumber = 0;
  let snakeKillOppty = 0;
  newBoards.forEach((boardStatus) => {
    if (!boardStatus.playerWin) {
      sureKill = false;
    } else {
      winNumber++;
    }
    if (boardStatus.snakeDeads) {
      snakeKillOppty += boardStatus.snakeDeads;
    }
  });

  trace(
    log.DEBUG,
    `Result of possibleEnemiesMoves win=${winNumber}, sureWin=${sureKill}, snakeKillOppty=${snakeKillOppty}`
  );

  return {
    winNumbers: winNumber,
    sureWin: sureKill,
    snakeKillOppty: snakeKillOppty,
    boardStatus: newBoards,
  };
}