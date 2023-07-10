import { Body, Controller, Get, Headers, Post, Res } from '@nestjs/common';
import { PATH } from '../../constants/paths';
import { RequestDataManager } from '../../services/requestDataManager/requestDataManager';
import { SessionService } from '../../services/session/session.service';
import { Response } from 'express';
import { PROXY_BODY } from './proxy.interface';
import { ProxyService } from './proxy.service';

@Controller(PATH.API.SELF)
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get(PATH.API.PROXY)
  async getList(
    @Headers(SessionService.HEADER_NAME) authorization: string,
    @Res() res: Response,
  ) {
    try {
      RequestDataManager.proceed(
        res,
        await this.proxyService.getList(authorization),
        ProxyService.LOG,
      );
    } catch (e: any) {
      ProxyService.LOG.fatal(JSON.stringify(e));
    }
  }

  @Post(PATH.API.PROXY)
  async addToList(
    @Headers(SessionService.HEADER_NAME) authorization: string,
    @Body() body: PROXY_BODY,
    @Res() res: Response,
  ) {
    try {
      RequestDataManager.proceed(
        res,
        await this.proxyService.addToList(authorization, body),
        ProxyService.LOG,
      );
    } catch (e: any) {
      ProxyService.LOG.fatal(JSON.stringify(e));
    }
  }
}
