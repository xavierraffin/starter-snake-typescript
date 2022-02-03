import { trace, logLevel as log } from "./logger";
import { GameState, Battlesnake, Coord } from "./types";

const SNAKE_NAKE = "Montgomery";

export function frameTranslator(frames: any, gameId: string): GameState {

  //console.log(frames.Frames[0]);
  //console.log("\n------------------------------\n");

  const frame: any = frames.Frames[0];

  const snakes: Battlesnake[] = [];
  let you: Battlesnake;
  frame.Snakes.forEach((frmSnake: any) => {
    if (frmSnake.Name === SNAKE_NAKE) {
        trace(log.INFO, `I found ${SNAKE_NAKE} !!!\n`);
        you = translateSnake(frmSnake);
    } else {
        if (frmSnake.Death == null) snakes.push(translateSnake(frmSnake));
    }
  });

  snakes.unshift(you!);

  const food: Coord[] = [];
  const hazards: Coord[] = [];

  frame.Food.forEach((element: any) => {
    food.push({ x: element.X, y: element.Y });
  });
  frame.Hazards.forEach((element: any) => {
    hazards.push({ x: element.X, y: element.Y });
  });

  const game: GameState = {
    game: {
      id: gameId,
      ruleset: {
        name: "standard",
        version: "v.1.2.3",
      },
      timeout: 500,
    },
    turn: frame.Turn,
    board: {
      height: 11,
      width: 11,
      food: food,
      snakes: snakes,
      hazards: hazards,
    },
    you: you!,
  };

  return game;
}

function translateSnake(frmSnake: any): Battlesnake {

    const body: Coord[] = [];
    frmSnake.Body.forEach((coord: any) => {
        body.push({x: coord.X, y: coord.Y});
    });

    const snake: Battlesnake = {
      id: frmSnake.ID,
      name: frmSnake.Name,
      health: frmSnake.Health,
      body: body,
      latency: "0",
      head: body[0],
      length: 0,
      shout: "",
      squad: "",
    };
    return snake;
}
