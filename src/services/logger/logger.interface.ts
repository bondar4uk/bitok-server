import { LoggerService } from './logger.service';

export enum LOG_DATA_TYPE {
  level = 'level',
  date = 'date',
  data = 'data',
  module = 'module',
}

export enum LOG_LEVEL {
  VERBOSE = 'VERBOSE',
  DEBUG = 'DEBUG',
  INFORMATION = 'INFORMATION',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export enum LOG_LEVEL_NUM {
  VERBOSE = 0,
  DEBUG = 1,
  INFORMATION = 2,
  WARNING = 3,
  ERROR = 4,
  FATAL = 5,
}

export const FILE_STREAM_TYPE = 'FILE' as const;
export const TERMINAL_STREAM_TYPE = 'CONSOLE' as const;
export const ALL_STREAM_TYPE = 'BOTH' as const;

export type OUTPUT_STREAM =
  | typeof FILE_STREAM_TYPE
  | typeof TERMINAL_STREAM_TYPE
  | typeof ALL_STREAM_TYPE;

export class CLoggerHolder {
  static MODULE_NAME = LoggerService.MODULE_NAME_DEFAULT as string;
}

export interface LoggingModulesConfig {
  [moduleName: string]: {
    log: boolean;
    type: string;
    level: string;
  };
}
