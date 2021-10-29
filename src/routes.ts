import { InfoResponse, GameState, MoveResponse } from "./types";

import { trace, logLevel as log } from "./logger";
import { move as GabrielMove } from "./GabrielAndXavier/move";
import { move as ArloMove } from "./ArloAndKim/move";
import { frameTranslator } from "./FrameTranslator";
import { killerSharkInfo, killerWhaleInfo } from "./GabrielAndXavier/colors";
import { arloAndKim1, arloAndKim2 } from "./ArloAndKim/colors";

import axios from "axios";

export function info(): InfoResponse {
  trace(log.INFO, "INFO");

  let response: InfoResponse;
  switch (process.env.SNAKE_INTERNAL_NAME) {
    case "killer-whale":
      response = killerWhaleInfo;
      break;
    case "killer-shark":
      response = killerSharkInfo;
      break;
    case "arlo-and-kim-1":
      response = arloAndKim1;
      break;
    default:
      response = arloAndKim2;
  }
  console.log(
    `Snake env = ${process.env.SNAKE_INTERNAL_NAME} ${process.env.LOG_LEVEL} ${process.env.PORT}`
  );
  return response;
}

export function start(gameState: GameState): void {
  console.log(
    ` START https://engine.battlesnake.com/games/${gameState.game.id}/frames`
  );
}

export function end(gameState: GameState): void {
  trace(log.INFO, `${gameState.game.id} END\n`);
}

export async function replayGameState(body: any): Promise<MoveResponse> {
  // Visualise https://play.battlesnake.com/g/a94caca6-6db6-4958-a1f0-466f41a89895/
  const url = `https://engine.battlesnake.com/games/${body.gameId}/frames?limit=1&offset=${body.turn}`;
  trace(log.INFO, `Downloading ${url}`);
  const response = await axios.get(url);
  const frames = response.data;
  const gameState: GameState = frameTranslator(frames, body.gameId);

  return move(gameState);
}

export async function move(body: any): Promise<MoveResponse> {
  switch (process.env.SNAKE_INTERNAL_NAME) {
    case "killer-whale":
    case "killer-shark":
      return GabrielMove(body);
    case "arlo-and-kim-1":
    default:
      return ArloMove(body);
  }
}
