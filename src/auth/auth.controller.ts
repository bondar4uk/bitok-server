import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Param,
} from '@nestjs/common';
import { PATH } from '../constants/paths';
import { AuthService } from './auth.service';
import {
  EMAIL,
  LOGIN_BODY,
  PASSWORD_RESET_BODY,
  REGISTER_BODY,
} from './auth.interface';
import { Response } from 'express';
import { RequestDataManager } from '../services/requestDataManager/requestDataManager';
import { SessionGuard } from '../services/session/session.guard';

@Controller(PATH.AUTH.SELF)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(PATH.AUTH.REGISTER)
  async register(
    @Body() body: REGISTER_BODY,
    @Res() res: Response,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.authService.register(body),
        AuthService.LOG,
      );
    } catch (e: any) {
      AuthService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.AUTH.LOGIN)
  async login(
    @Body() body: LOGIN_BODY,
    @Res() res: Response,
    @Req() req: any,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.authService.login(body, req.ip),
        AuthService.LOG,
      );
    } catch (e: any) {
      AuthService.LOG.fatal(JSON.stringify(e));
    }
  }

  @UseGuards(SessionGuard)
  @Get(PATH.AUTH.LOGOUT)
  async logout(@Res() res: Response, @Req() req: any): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.authService.logout(req.user.email),
        AuthService.LOG,
      );
    } catch (e: any) {
      AuthService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.AUTH.FORGOT_PASSWORD.SELF)
  async forgotPassword(
    @Body() body: EMAIL,
    @Res() res: Response,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.authService.forgotPassword(body),
        AuthService.LOG,
      );
    } catch (e: any) {
      AuthService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Get(PATH.AUTH.RESET_PASSWORD.SELF)
  async checkResetPasswordCode(
    @Param('token') token: string,
    @Param('email') email: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.authService.checkResetPasswordCode(email, token),
        AuthService.LOG,
      );
    } catch (e: any) {
      AuthService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.AUTH.RESET_PASSWORD.SELF)
  async resetPassword(
    @Param('token') token: string,
    @Param('email') email: string,
    @Body() body: PASSWORD_RESET_BODY,
    @Res() res: Response,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.authService.resetPassword(email, token, body),
        AuthService.LOG,
      );
    } catch (e: any) {
      AuthService.LOG.fatal(JSON.stringify(e));
    }
  }
}
