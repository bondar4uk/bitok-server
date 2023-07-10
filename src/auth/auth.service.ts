import { Inject, Injectable } from '@nestjs/common';
import {
  EMAIL,
  LOGIN_BODY,
  PASSWORD_RESET_BODY,
  REGISTER_BODY,
} from './auth.interface';
import { SessionService } from '../services/session/session.service';
import { RESULT_CODE } from '../constants/codes';
import { RESPONSE_MESSAGE } from '../constants/responses';
import { KeyGeneratorService } from '../services/key-generator/key-generator.service';
import { RESPONSE } from '../types/controllerTypes';
import { RequestDataManager } from '../services/requestDataManager/requestDataManager';
import { DbmanagerService } from '../services/dbmanager/dbmanager.service';
import { LoggerService } from '../services/logger/logger.service';
import { SmtpService } from '../services/smtp/smtp.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  private codes: { email: string; code: string; time: Date; type: string }[] =
    [];
  //TODO to .env
  private codeEnterTimeLimitSeconds = 60;
  private sendCodeIntervalMinutes = 0.25;
  private lastCodeSentTime: Date | null = null;
  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate('auth'),
  );

  constructor(
    private readonly dbManagerService: DbmanagerService,
    private readonly smtpService: SmtpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(data: LOGIN_BODY, ip: string): Promise<RESPONSE> {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        LOGIN_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }

      const { email, password, code_2fa } = validationResult.DATA;
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

      if (
        existingUser.two_factor_secret !== null &&
        !SessionService.verifyCode(code_2fa, existingUser.two_factor_secret)
      ) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.TWO_FACTOR_AUTHENTICATION_FAILURE(),
        );
      }

      const isAdmin = email === process.env.EXCHANGE_SUPPORT_ACCOUNT_EMAIL;
      AuthService.LOG.information(
        RESPONSE_MESSAGE.USER_ENTERED_SYSTEM(email, isAdmin),
      );
      const session = SessionService.create({ email, ip });

      await this.cacheManager.set(email, session, 0);

      return RequestDataManager.ok({
        session: `${session}${isAdmin ? process.env.SESSION_ADMIN_SIGN : ''}`,
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async logout(email: string): Promise<RESPONSE> {
    try {
      await this.cacheManager.del(email);
      const isAdmin = email === process.env.EXCHANGE_SUPPORT_ACCOUNT_EMAIL;
      AuthService.LOG.information(
        RESPONSE_MESSAGE.USER_LOGGED_OUT(email, isAdmin),
      );
      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.LOGOUT_SUCCESSFUL(),
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async forgotPassword(data: EMAIL) {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        EMAIL.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }

      const { email } = validationResult.DATA;

      const existingUser = await this.dbManagerService.getUser(email);
      if (!existingUser) {
        return RequestDataManager.userConflict(email, false);
      }

      return this.sendToken(email);
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async checkResetPasswordCode(
    email: string,
    token: string,
  ): Promise<RESPONSE> {
    try {
      const existingUser = await this.dbManagerService.getUser(email);
      if (!existingUser) {
        return RequestDataManager.userConflict(email, false);
      }

      return await this.validateCode(email, token, 'pass');
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async resetPassword(
    email: string,
    token: string,
    data: PASSWORD_RESET_BODY,
  ): Promise<RESPONSE> {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        PASSWORD_RESET_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }

      const { new_password } = validationResult.DATA;

      const existingUser = await this.dbManagerService.getUser(email);
      if (!existingUser) {
        return RequestDataManager.userConflict(email, false);
      }

      const res = await this.validateCode(email, token, 'pass');
      if (res.CODE !== RESULT_CODE.SUCCESS.OK) {
        return res;
      }

      const isValidPassword = await KeyGeneratorService.HashValidate(
        new_password,
        existingUser.password,
      );
      if (isValidPassword) {
        return RequestDataManager.badRequest(
          RESPONSE_MESSAGE.PASSWORDS_MATCH(),
        );
      }

      existingUser.password = await KeyGeneratorService.HashCreate(
        new_password,
      );

      await this.dbManagerService.updateUser(email, existingUser);
      this.codes = this.codes.filter((item) => item.email !== email);
      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.PASSWORD_RESET_SUCCESS(email),
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  async register(data: REGISTER_BODY): Promise<RESPONSE> {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        REGISTER_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }

      const { email, code } = validationResult.DATA;
      const existingUser = await this.dbManagerService.getUser(email);
      if (existingUser) {
        return RequestDataManager.userConflict(email, true);
      }

      if (!code) {
        return await this.sendCode(email);
      }

      const res = await this.validateCode(email, code, 'reg');
      if (res.CODE !== RESULT_CODE.SUCCESS.OK) {
        return res;
      }

      await this.dbManagerService.addUser(data);
      this.codes = this.codes.filter((item) => item.email !== email);

      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.USER_SUCCESSFULLY_REGISTERED(email),
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  private async validateCode(
    email: string,
    code: string,
    type: string,
  ): Promise<RESPONSE> {
    try {
      const data = this.codes.find((val) => val.email === email);

      if (!data) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_CODE_WRONG(),
        );
      }

      const { type: codeType, time: creationTime, code: hash } = data;

      if (codeType !== type) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_CODE_WRONG(),
        );
      }

      if (!this.isCodeValid(creationTime)) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_CODE_EXPIRED(),
        );
      }

      const isValid = await KeyGeneratorService.HashValidate(code, hash);

      if (!isValid) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_CODE_WRONG(),
        );
      }

      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.PASSWORD_RESET_CODE_VALID(),
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  private isCodeValid(creationTime: Date): boolean {
    try {
      const currentDate = new Date();
      const dif = currentDate.getTime() - creationTime.getTime();
      const actualDif = dif / 1000;
      return actualDif <= this.codeEnterTimeLimitSeconds;
    } catch (e: any) {
      AuthService.LOG.fatal(JSON.stringify(e));
      return false;
    }
  }

  private async generateCode(email: string, length: number, type: string) {
    try {
      const currentDate = new Date();

      if (
        this.lastCodeSentTime &&
        currentDate.getTime() - this.lastCodeSentTime.getTime() <
          this.sendCodeIntervalMinutes * 60 * 1000
      ) {
        return RequestDataManager.tooManyRequests(
          RESPONSE_MESSAGE.ERROR_TOO_MANY_REQUESTS(),
        );
      }

      const tempCode = KeyGeneratorService.Create(length);
      const codeEnc = await KeyGeneratorService.HashCreate(tempCode);

      this.codes = this.codes.filter(
        (item) => item.email !== email && this.isCodeValid(item.time),
      );
      this.codes.push({ email, code: codeEnc, time: new Date(), type });

      this.lastCodeSentTime = currentDate;

      return tempCode;
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  private async sendCode(email: string): Promise<RESPONSE> {
    try {
      const tempCode = await this.generateCode(email, 20, 'reg');

      if (typeof tempCode !== 'string') {
        return tempCode;
      }

      return this.smtpService.SendMail(email, './confirmation', {
        temp_pass: tempCode,
        InstanceAddress: 'https://bitok.pro',
        InstanceName: 'bitok.pro',
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }

  private async sendToken(email: string): Promise<RESPONSE> {
    try {
      const token = await this.generateCode(email, 50, 'pass');

      if (typeof token !== 'string') {
        return token;
      }

      return this.smtpService.SendMail(email, './password-reset', {
        token: `http://localhost:3000/auth/resetPassword/${email}/${token}`,
        InstanceAddress: 'https://bitok.pro',
        InstanceName: 'bitok.pro',
      });
    } catch (e: any) {
      return RequestDataManager.internalServerError(JSON.stringify(e));
    }
  }
}
