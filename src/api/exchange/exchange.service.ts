import { Injectable } from '@nestjs/common';
import {
  ACCOUNT_INFO_BODY,
  ACCOUNT_INFO_SCHEMA,
  AExchange,
  Credentials,
} from './exchange.interface';
import { RESPONSE } from '../../types/controllerTypes';
import { RequestDataManager } from '../../services/requestDataManager/requestDataManager';
import { RESULT_CODE } from '../../constants/codes';
import { DbmanagerService } from '../../services/dbmanager/dbmanager.service';
import credentialsJson from './credentials-default.json';
import { EXCHANGES } from '../../constants/DBTypes';
import { ClientService as BybitClient } from './bybit/client/client.service';
import { RESPONSE_MESSAGE } from '../../constants/responses';
import { LoggerService } from '../../services/logger/logger.service';

@Injectable()
export class ExchangeService {
  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate('account'),
  );
  static parseDefaultConfiguration() {
    const defaultCredentials = JSON.parse(JSON.stringify(credentialsJson));
    const keys: Credentials[] = [];

    EXCHANGES.forEach((val: string) => {
      if (!!defaultCredentials[val]?.testNet?.apiKey?.length) {
        keys.push(
          new Credentials(
            defaultCredentials[val]?.testNet?.apiKey,
            defaultCredentials[val]?.testNet?.secretKey,
            false,
            val,
          ),
        );
      }
      if (!!defaultCredentials[val]?.liveNet?.apiKey?.length) {
        keys.push(
          new Credentials(
            defaultCredentials[val]?.testNet?.apiKey,
            defaultCredentials[val]?.testNet?.secretKey,
            true,
            val,
          ),
        );
      }
    });
    return keys;
  }

  static KEYS = ExchangeService.parseDefaultConfiguration();

  constructor(private readonly dbManagerService: DbmanagerService) {}

  async checkDefaultUsers() {
    const email = process.env.EXCHANGE_SUPPORT_ACCOUNT_EMAIL;
    if (!email) {
      return;
    }
    const admin = await this.dbManagerService.getUser(email);
    if (!admin) {
      await this.dbManagerService.addUser({
        email,
        password: process.env.EXCHANGE_SUPPORT_ACCOUNT_PASSWORD,
        name: process.env.EXCHANGE_SUPPORT_ACCOUNT_NAME,
      });
    }
    ExchangeService.KEYS.map(async (val) => {
      const holder = await this.dbManagerService.getKeys(
        email,
        val.exchange,
        val.isLiveNet,
      );
      if (!holder) {
        await this.dbManagerService.addKeys(
          email,
          val.api,
          val.secret,
          val.exchange,
          val.isLiveNet,
        );
      } else {
        holder.api_key = val.api;
        holder.secret_key = val.secret;
        holder.trading_status = false;
        await holder.save();
      }
    });
  }

  async getAccountInfo(
    email: string,
    data: ACCOUNT_INFO_BODY,
  ): Promise<RESPONSE> {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        ACCOUNT_INFO_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }
      const client = await this.getExchangeClient(email, validationResult.DATA);
      if (!client) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_NO_KEYS_EXIST(),
        );
      }
      return RequestDataManager.ok(await client.getAccountInfo());
    } catch (e: any) {
      return RequestDataManager.internalServerError();
    }
  }

  async getAccountBalance(email: string, data: ACCOUNT_INFO_BODY) {
    try {
      const validationResult = RequestDataManager.validate(
        data,
        ACCOUNT_INFO_BODY.VALIDATOR,
      );
      if (validationResult.CODE !== RESULT_CODE.SUCCESS.OK) {
        return validationResult;
      }
      const client = await this.getExchangeClient(email, validationResult.DATA);
      if (!client) {
        return RequestDataManager.unauthorized(
          RESPONSE_MESSAGE.ERROR_NO_KEYS_EXIST(),
        );
      }

      const info = await client.getWalletBalance('linear', 'USDT');
      return RequestDataManager.ok(info);
    } catch (e: any) {
      return RequestDataManager.internalServerError();
    }
  }

  private async getExchangeClient(email: string, data: ACCOUNT_INFO_SCHEMA) {
    const { exchange, isLiveNet } = data;
    let client: AExchange;
    const credentials = await this.dbManagerService.getCredentials(
      email,
      exchange,
      isLiveNet,
    );
    if (!credentials) {
      return null;
    }

    switch (exchange) {
      default:
        {
          client = new BybitClient(credentials);
        }
        break;
    }
    return client;
  }
}
