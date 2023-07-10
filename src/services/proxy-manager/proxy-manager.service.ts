import { ProxyModel } from '../../models/proxy.model';
import { RequestDataManager } from '../requestDataManager/requestDataManager';
import { LoggerService } from '../logger/logger.service';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as https from 'https';
import { RESULT_CODE } from '../../constants/codes';
import { SERVER_PROXY_VALIDATION_URL_BASIC } from '../../constants/server';

export class ProxyManagerService {
  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate('ProxyManagerService'),
  );

  static VALIDATION_URL: string = !!process.env.PROXY_CUSTOM_VALIDATION_URL
    ? process.env.PROXY_CUSTOM_VALIDATION_URL
    : SERVER_PROXY_VALIDATION_URL_BASIC;

  static CREATE_AGENT(proxy: ProxyModel) {
    const credentials =
      !!proxy.user.length && !!proxy.password.length
        ? `${proxy.user}:${proxy.password}@`
        : '';
    return new HttpsProxyAgent(
      `https://${credentials}${proxy.host}:${proxy.port}`,
    );
  }

  static REQUEST_GET(
    client: HttpsProxyAgent<string>,
    targetUrl: string,
    callback: (code: number) => void,
    dataBuffer: (data: string) => void,
  ) {
    console.log('==============');
    https.get(targetUrl, { agent: client }, (res) => {
      res.on('data', (chunk) => {
        dataBuffer(chunk);
      });

      res.on('end', () => {
        console.log(res.statusCode);
        if (!res.statusCode) {
          callback(RESULT_CODE.CLIENT_ERROR.BAD_REQUEST);
        }
        callback(res.statusCode as number);
      });
    });
  }

  static CHECK_PROXY(proxy: ProxyModel) {
    const client = this.CREATE_AGENT(proxy);
    let result = -1;
    let data = '';
    this.REQUEST_GET(
      client,
      'https://www.google.com',
      (code: number) => {
        console.log(data);
        result = code;
      },
      (chunk: string) => {
        data += chunk;
      },
    );
    return RequestDataManager.ok(data);
  }
}
