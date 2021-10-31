
import { Board, Direction, MoveInfo, BoardStatus } from "../types";

import { findNextMove } from "./SingleMoveEvaluator";
import { boardAfterEnemiesMove } from "./GameSimulator";

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
    currentMoves.push(this);
    if (this.childs.length === 0) {
      newBoardStatuses.push(boardAfterEnemiesMove(currentMoves, referenceBoard));
    } else {
      this.childs.forEach((move) => {
        move.findAllFinalMoves(currentMoves, referenceBoard, newBoardStatuses);
      });
    }
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
  const snakes = board.snakes;
  let snakeSureKills = 0;
  let numberOfEnemyAlive = snakes.length - 1;
  const nonWinOrLoseBoards: Board[] = new Array();
  const root: SnakeMove = new SnakeMove({
    snakeIndex: myIndex,
    direction: Direction.UP, // the root tree direction is never read and therefore arbitrary
  });
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

  return {
    winNumbers: 0,
    sureWin: false,
    snakeKillOppty: snakeSureKills,
    boardStatus: newBoards,
  };
}