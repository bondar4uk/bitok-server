import {
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  Req,
  Body,
  Param,
} from '@nestjs/common';
import { PATH } from '../constants/paths';
import { SessionGuard } from '../services/session/session.guard';
import { AccountService } from './account.service';
import { Response } from 'express';
import { RequestDataManager } from '../services/requestDataManager/requestDataManager';
import {
  ACCOUNT_DELETE_BODY,
  NAME_CHANGE_BODY,
  PASSWORD_CHANGE_BODY,
} from './account.interface';

@UseGuards(SessionGuard)
@Controller(PATH.ACCOUNT.SELF)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get(PATH.ACCOUNT.USER_DATA.SELF)
  async getUserInfo(@Res() res: Response, @Req() req: any): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.accountService.getUserInfo(req.user.email),
        AccountService.LOG,
      );
    } catch (e: any) {
      AccountService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.ACCOUNT.CHANGE_PASSWORD.SELF)
  async changePassword(
    @Body() body: PASSWORD_CHANGE_BODY,
    @Res() res: Response,
    @Req() req: any,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.accountService.changePassword(req.user.email, body),
        AccountService.LOG,
      );
    } catch (e: any) {
      AccountService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.ACCOUNT.CHANGE_NAME.SELF)
  async changeName(
    @Body() body: NAME_CHANGE_BODY,
    @Res() res: Response,
    @Req() req: any,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.accountService.changeName(req.user.email, body),
        AccountService.LOG,
      );
    } catch (e: any) {
      AccountService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.ACCOUNT.DELETE_ACCOUNT.SELF)
  async deleteAccount(
    @Body() body: ACCOUNT_DELETE_BODY,
    @Res() res: Response,
    @Req() req: any,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.accountService.deleteAccount(req.user.email, body),
        AccountService.LOG,
      );
    } catch (e: any) {
      AccountService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Get(PATH.ACCOUNT.TWOFA.SELF)
  async toggleTwoFactorAuthentication(
    @Res() res: Response,
    @Req() req: any,
    @Param('enable') enable: string,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.accountService.toggleTwoFactorAuthentication(
          req.user.email,
          enable,
        ),
        AccountService.LOG,
      );
    } catch (e: any) {
      AccountService.LOG.fatal(JSON.stringify(e));
    }
  }
}
