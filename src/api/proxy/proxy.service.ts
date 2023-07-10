import { Injectable } from '@nestjs/common';
import { ProxyModel } from '../../models/proxy.model';
import { PATH } from '../../constants/paths';
import { RESULT_CODE } from '../../constants/codes';
import { RESPONSE_MESSAGE } from '../../constants/responses';
import { PROXY_BODY } from './proxy.interface';
import { LoggerService } from '../../services/logger/logger.service';
import { DbmanagerService } from '../../services/dbmanager/dbmanager.service';
import { RequestDataManager } from '../../services/requestDataManager/requestDataManager';
import { SessionService } from '../../services/session/session.service';
import { ProxyManagerService } from '../../services/proxy-manager/proxy-manager.service';

@Injectable()
export class ProxyService {
  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate(PATH.API.PROXY),
  );

  constructor(private readonly dbManagerService: DbmanagerService) {}

  async checkDefaultProxy() {
    const host = process.env.PROXY_CUSTOM_LOCAL_HOST;
    const port = process.env.PROXY_CUSTOM_LOCAL_PORT;
    if (host && port) {
      this.dbManagerService.getProxy(host, port).then(async (val) => {
        if (!val) {
          await this.dbManagerService.addProxy({
            host: host,
            port: port,
            user: '-',
            password: '-',
          } as ProxyModel);
        }
      });
    }
  }

  async getList(session: string) {
    try {
      const adminVerification = await this.adminCheck(session);
      if (adminVerification.CODE !== RESULT_CODE.SUCCESS.OK) {
        return adminVerification;
      }
      const { email } = adminVerification.DATA;

      return RequestDataManager.ok();
    } catch (e: any) {
      return RequestDataManager.internalServerError();
    }
  }

  async addToList(session: string, body: PROXY_BODY) {
    try {
      const adminVerification = await this.adminCheck(session);
      if (adminVerification.CODE !== RESULT_CODE.SUCCESS.OK) {
        return adminVerification;
      }
      const { email } = adminVerification.DATA;
      const validationResult = RequestDataManager.validate(
        body,
        PROXY_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }

      const proxy: ProxyModel = validationResult.DATA;
      const checkResult = ProxyManagerService.CHECK_PROXY(proxy);
      if (checkResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return checkResult;
      }
      //this.dbManagerService.AddProxy(proxy);
      return RequestDataManager.ok(checkResult.DATA);
    } catch (e: any) {
      return RequestDataManager.internalServerError();
    }
  }

  private async adminCheck(session: string) {
    const verificationResult = SessionService.verify(session);
    if (verificationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
      return verificationResult;
    }
    const { email } = verificationResult.DATA;
    if (email !== process.env.EXCHANGE_SUPPORT_ACCOUNT_EMAIL) {
      return RequestDataManager.unauthorized(
        RESPONSE_MESSAGE.ERROR_PERMISSION_RESTRICTED(),
      );
    }
    return RequestDataManager.ok({ email: email });
  }
}
