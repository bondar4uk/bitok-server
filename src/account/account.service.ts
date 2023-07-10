import { Injectable } from '@nestjs/common';
import { LoggerService } from '../services/logger/logger.service';
import { DbmanagerService } from '../services/dbmanager/dbmanager.service';
import { RequestDataManager } from '../services/requestDataManager/requestDataManager';
import { KeyGeneratorService } from '../services/key-generator/key-generator.service';
import { RESPONSE_MESSAGE } from '../constants/responses';
import { RESULT_CODE } from '../constants/codes';
import { SessionService } from '../services/session/session.service';
import { RESPONSE } from '../types/controllerTypes';
import {
  ACCOUNT_DELETE_BODY,
  NAME_CHANGE_BODY,
  PASSWORD_CHANGE_BODY,
} from './account.interface';

@Injectable()
export class AccountService {
  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate('account'),
  );

  constructor(private readonly dbManagerService: DbmanagerService) {}

  async getUserInfo(email: string): Promise<RESPONSE> {
    try {
      const user = await this.dbManagerService.getUser(email, ['name']);
      if (!user) {
        return RequestDataManager.userConflict(email, false);
      }

      return RequestDataManager.ok({ email, name: user.name });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async deleteAccount(
    email: string,
    data: ACCOUNT_DELETE_BODY,
  ): Promise<RESPONSE> {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        ACCOUNT_DELETE_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }
      const { password } = validationResult.DATA;

      const existingUser = await this.dbManagerService.getUser(email);
      if (!existingUser) {
        return RequestDataManager.userConflict(email, false);
      }

      const isValidPassword = await KeyGeneratorService.HashValidate(
        password,
        existingUser.password,
      );
      if (!isValidPassword) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_INVALID_PASSWORD(),
        );
      }

      //TODO
      await this.dbManagerService.removeUser(email);
      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.ACCOUNT_DELETED(email),
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async changePassword(
    email: string,
    data: PASSWORD_CHANGE_BODY,
  ): Promise<RESPONSE> {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        PASSWORD_CHANGE_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }
      const { current_password, new_password } = validationResult.DATA;

      if (current_password === new_password) {
        return RequestDataManager.badRequest(
          RESPONSE_MESSAGE.PASSWORDS_MATCH(),
        );
      }

      const existingUser = await this.dbManagerService.getUser(email);
      if (!existingUser) {
        return RequestDataManager.userConflict(email, false);
      }

      const isValidPassword = await KeyGeneratorService.HashValidate(
        current_password,
        existingUser.password,
      );
      if (!isValidPassword) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_INVALID_PASSWORD(),
        );
      }
      existingUser.password = await KeyGeneratorService.HashCreate(
        new_password,
      );

      await this.dbManagerService.updateUser(email, existingUser);
      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.PASSWORD_CHANGED_SUCCESS(email),
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async changeName(email: string, data: NAME_CHANGE_BODY): Promise<RESPONSE> {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        NAME_CHANGE_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }
      const { new_name } = validationResult.DATA;

      const existingUser = await this.dbManagerService.getUser(email);
      if (!existingUser) {
        return RequestDataManager.userConflict(email, false);
      }

      if (existingUser.name === new_name) {
        return RequestDataManager.badRequest(RESPONSE_MESSAGE.NAMES_MATCH());
      }
      existingUser.name = new_name;

      await this.dbManagerService.updateUser(email, existingUser);
      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.NAME_CHANGED_SUCCESS(email),
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async toggleTwoFactorAuthentication(
    email: string,
    enable: string,
  ): Promise<RESPONSE> {
    try {
      if (enable !== 'true' && enable !== 'false') {
        return RequestDataManager.badRequest(
          RESPONSE_MESSAGE.ERROR_INVALID_VALUE('enable'),
        );
      }
      const enableBool = JSON.parse(enable);

      const existingUser = await this.dbManagerService.getUser(email);
      if (!existingUser) {
        return RequestDataManager.userConflict(email, false);
      }

      if (enableBool) {
        const { secret, qrCodeBase64 } = await SessionService.generateSecret(
          email,
        );

        existingUser.two_factor_secret = secret;
        await this.dbManagerService.updateUser(email, existingUser);
        return RequestDataManager.ok({ qrCodeBase64 });
      } else {
        if (existingUser.two_factor_secret === null) {
          return RequestDataManager.badRequest(
            RESPONSE_MESSAGE.TWO_FACTOR_ALREADY_DISABLED(),
          );
        }

        existingUser.two_factor_secret = null;
        await this.dbManagerService.updateUser(email, existingUser);
        return RequestDataManager.ok({
          message: RESPONSE_MESSAGE.TWO_FACTOR_DISABLED_SUCCESS(),
        });
      }
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }
}
