export enum logLevel {
  DEBUG = 0,
  VERBOSE = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

const LOG_LEVEL = logLevel.VERBOSE;

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
    console.log(`[${logLevel[level]}] ${indent}${msg}`);
  }
}
