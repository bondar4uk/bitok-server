import { RESPONSE, VALIDATOR_CONTAINER } from '../../types/controllerTypes';
import { RESULT_CODE } from '../../constants/codes';
import { RESPONSE_MESSAGE } from '../../constants/responses';
import { Response } from 'express';
import { ZodObject } from 'zod';
import { CLoggerHolder } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';

export class RequestDataManager extends CLoggerHolder {
  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate('RequestDataManager'),
  );

  static validate<T extends VALIDATOR_CONTAINER>(
    data: T,
    validator: ZodObject<any>,
  ): RESPONSE {
    try {
      const validated = validator.parse(data);
      return RequestDataManager.ok(validated);
    } catch (e: any) {
      RequestDataManager.LOG.error(`Validation data error`);
      const { issues } = e;
      return RequestDataManager.badRequest(
        issues.map((val: any) =>
          JSON.parse(`{"${val.path[0]}": "${val.message}"}`),
        ),
      );
    }
  }

  static proceed(
    res: Response,
    result: RESPONSE,
    LOG: LoggerService = RequestDataManager.LOG,
  ) {
    LOG.verbose(JSON.stringify(result));
    res.status(result.CODE).json(result.DATA);
  }

  //success
  static ok(data: any = null): RESPONSE {
    return {
      CODE: RESULT_CODE.SUCCESS.OK,
      DATA: data,
    };
  }

  //client error
  static badRequest(message: string | string[] = ''): RESPONSE {
    return {
      CODE: RESULT_CODE.CLIENT_ERROR.BAD_REQUEST,
      DATA: {
        error: this.messageConvert(message),
      },
    };
  }

  static unauthorized(message: string | string[]): RESPONSE {
    return {
      CODE: RESULT_CODE.CLIENT_ERROR.UNAUTHORIZED,
      DATA: { error: this.messageConvert(message) },
    };
  }

  static tooManyRequests(message: string | string[]): RESPONSE {
    return {
      CODE: RESULT_CODE.CLIENT_ERROR.TOO_MANY_REQUESTS,
      DATA: { error: this.messageConvert(message) },
    };
  }

  static userConflict(data: string, exists: boolean): RESPONSE {
    return {
      CODE: RESULT_CODE.CLIENT_ERROR.CONFLICT,
      DATA: {
        error: this.messageConvert(
          exists
            ? RESPONSE_MESSAGE.ERROR_USER_EXISTS(data)
            : RESPONSE_MESSAGE.ERROR_USER_DOES_NOT_EXIST(data),
        ),
      },
    };
  }

  //server error
  static internalServerError(data: any = null) {
    return {
      CODE: RESULT_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      DATA: {
        error: data,
      },
    };
  }

  static messageConvert(message: string | string[]) {
    return typeof message === 'string' ? [message] : [...message];
  }
}
