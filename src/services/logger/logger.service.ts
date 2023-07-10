import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import * as fs from 'fs-extra';
import {
  FILE_STREAM_TYPE,
  LOG_DATA_TYPE,
  LOG_LEVEL,
  LOG_LEVEL_NUM,
  OUTPUT_STREAM,
  TERMINAL_STREAM_TYPE,
} from './logger.interface';
import { LOGGER_MODULES_PARAMS } from '../../constants/server';

@Injectable()
export class LoggerService {
  doLogging: boolean;
  level: LOG_LEVEL;
  stream: OUTPUT_STREAM;
  moduleName: string;

  static MODULE_NAME_DEFAULT = 'unknown' as const;
  static MODULE_OUTPUT_STREAM_DEFAULT = 'BOTH' as const;
  static MODULE_DO_LOGGING_DEFAULT = true as const;
  static MODULE_LEVEL_DEFAULT = 'VERBOSE' as LOG_LEVEL;

  static moduleNameValidate(moduleName: string) {
    try {
      return !moduleName || !LOGGER_MODULES_PARAMS?.[moduleName]
        ? LoggerService.MODULE_NAME_DEFAULT
        : moduleName;
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  static loadCustomConfiguration(moduleName?: string) {
    try {
      const field =
        !moduleName || !LOGGER_MODULES_PARAMS?.[moduleName]
          ? LoggerService.MODULE_NAME_DEFAULT
          : moduleName;
      const level = LOGGER_MODULES_PARAMS?.[field]?.level as LOG_LEVEL;
      const stream = LOGGER_MODULES_PARAMS?.[field]?.type as OUTPUT_STREAM;
      const doLogging = LOGGER_MODULES_PARAMS?.[field]?.log;
      return new LoggerService(level, stream, doLogging, field);
    } catch (e) {
      console.log(e.toString());
      return new LoggerService(
        LoggerService.MODULE_LEVEL_DEFAULT,
        LoggerService.MODULE_OUTPUT_STREAM_DEFAULT,
        LoggerService.MODULE_DO_LOGGING_DEFAULT,
        LoggerService.MODULE_NAME_DEFAULT,
      );
    }
  }

  static DATE_FORMAT_DEFAULT = 'dd.MM.yyyy HH:mm:ss';
  static DATE_FORMAT = process.env.LOGGER_DATA_DATE_FORMAT
    ? process.env.LOGGER_DATA_DATE_FORMAT
    : LoggerService.DATE_FORMAT_DEFAULT;

  static DATA_FORMAT_DEFAULT = 'date-level: data';
  static DATA_FORMAT = process.env.LOGGER_DATA_FORMAT
    ? process.env.LOGGER_DATA_FORMAT
    : LoggerService.DATA_FORMAT_DEFAULT;

  static formatApply(
    message: string,
    date: string,
    level: LOG_LEVEL,
    moduleName: string = LoggerService.MODULE_NAME_DEFAULT,
  ) {
    try {
      let res = this.DATA_FORMAT;
      Object.entries(LOG_DATA_TYPE).forEach((entry) => {
        const type = entry[0];
        if (res.includes(type)) {
          const temp: string[] = res.split(type);
          let insertion: string;
          switch (type) {
            case LOG_DATA_TYPE.level:
              insertion = level;
              break;
            case LOG_DATA_TYPE.data:
              insertion = message;
              break;
            case LOG_DATA_TYPE.date:
              insertion = date;
              break;
            case LOG_DATA_TYPE.module:
              insertion = moduleName;
              break;
            default:
              insertion = '';
          }
          res = temp[0] + insertion + temp[1];
        }
      });

      return res;
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  constructor(
    minimal_level: LOG_LEVEL = LOG_LEVEL.DEBUG,
    output_stream: OUTPUT_STREAM = TERMINAL_STREAM_TYPE,
    doLogging = true,
    moduleName: string = LoggerService.MODULE_NAME_DEFAULT,
  ) {
    this.level = minimal_level;
    this.stream = output_stream;
    this.doLogging = doLogging;
    this.moduleName = moduleName;
  }

  private async write(message: string, level: LOG_LEVEL) {
    try {
      if (
        !this.doLogging ||
        LOG_LEVEL_NUM[level as keyof typeof LOG_LEVEL_NUM] <
          LOG_LEVEL_NUM[this.level as keyof typeof LOG_LEVEL_NUM]
      ) {
        return;
      }

      const date = new Date();
      const Day = date.getDate();
      const Month = date.getMonth() + 1;
      const Year = date.getFullYear();
      const dateConv = format(date, LoggerService.DATE_FORMAT);
      const logged = LoggerService.formatApply(
        message,
        dateConv,
        level,
        this.moduleName,
      );

      if (!logged) {
        return;
      }

      if (this.stream === TERMINAL_STREAM_TYPE || this.stream === 'BOTH') {
        console.log(logged);
      }

      if (
        (this.stream === FILE_STREAM_TYPE || this.stream === 'BOTH') &&
        process.env.LOGGER_STREAM_PATH
      ) {
        const path = `${process.env.LOGGER_STREAM_PATH}/${Year}/${Month}/log-${Day}.txt`;
        const fileExists = await fs.pathExists(path);

        if (fileExists) {
          const text = await fs.readFile(path, 'utf-8');
          await fs.writeFile(path, `${text}\n${logged}`);
        } else {
          await fs.outputFile(path, logged);
        }
      }
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  log(message: string, level: LOG_LEVEL) {
    this.write(message, level);
  }

  verbose(message: string) {
    this.log(message, LOG_LEVEL.VERBOSE);
  }

  debug(message: string) {
    this.log(message, LOG_LEVEL.DEBUG);
  }

  information(message: string) {
    this.log(message, LOG_LEVEL.INFORMATION);
  }

  warning(message: string) {
    this.log(message, LOG_LEVEL.WARNING);
  }

  error(message: string) {
    this.log(message, LOG_LEVEL.ERROR);
  }

  fatal(message: string) {
    this.log(message, LOG_LEVEL.FATAL);
  }
}
