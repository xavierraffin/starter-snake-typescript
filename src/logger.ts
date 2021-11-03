export enum logLevel {
  DEBUG = 0,
  VERBOSE = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

let gameId = "";
export function setGameId(id: string){
  gameId = id;
}

let LOG_LEVEL = logLevel.DEBUG;
if (process.env.LOG_LEVEL) {
  LOG_LEVEL = parseInt(process.env.LOG_LEVEL) as logLevel;
}

export function trace(
  level: logLevel,
  msg: any,
  indentCharsNb: number = 0
): void {
  if (level >= LOG_LEVEL) {
    let indent = "";
    for (let i = 0; i < indentCharsNb; i++) {
      indent += " ";
    }
    console.log(`[${logLevel[level]}] ${gameId} ${indent}${msg}`);
  }
}
