import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../../services/session/session.guard';
import { PATH } from '../../constants/paths';
import { Response } from 'express';
import { ACCOUNT_INFO_BODY } from './exchange.interface';
import { ExchangeService } from './exchange.service';
import { RequestDataManager } from '../../services/requestDataManager/requestDataManager';

@UseGuards(SessionGuard)
@Controller(PATH.API.EXCHANGE.FULL())
export class ExchangeController {
  constructor(private exchangeService: ExchangeService) {}

  @Post(PATH.API.EXCHANGE.ACCOUNT_INFO)
  async getAccountInfo(
    @Req() req: any,
    @Body() body: ACCOUNT_INFO_BODY,
    @Res() res: Response,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.exchangeService.getAccountInfo(req.user.email, body),
        ExchangeService.LOG,
      );
    } catch (e: any) {
      ExchangeService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.API.EXCHANGE.BALANCE)
  async getAccountBalance(
    @Req() req: any,
    @Body() body: ACCOUNT_INFO_BODY,
    @Res() res: Response,
  ): Promise<any> {
    try {
      RequestDataManager.proceed(
        res,
        await this.exchangeService.getAccountBalance(req.user.email, body),
        ExchangeService.LOG,
      );
    } catch (e: any) {
      ExchangeService.LOG.fatal(JSON.stringify(e));
    }
  }
}
