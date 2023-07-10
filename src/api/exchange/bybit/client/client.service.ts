import { AExchange, Credentials } from '../../exchange.interface';
import {
  AccountTypeV5,
  CategoryV5,
  OrderSideV5,
  OrderTypeV5,
  RestClientV5,
} from 'bybit-api';

export class ClientService extends AExchange {
  credentials: Credentials;

  private readonly client: RestClientV5;

  constructor(credentials: Credentials) {
    super(credentials);
    this.client = new RestClientV5({
      key: credentials.api,
      secret: credentials.secret,
      testnet: !credentials.isLiveNet,
      //recv_window: 100000,
      enable_time_sync: true,
    });
  }

  getAccountInfo(): any {
    return this.client.getAccountInfo();
  }

  closeOrder(category: CategoryV5, symbol: string, orderId: string): any {}

  getPositionInfo(category: CategoryV5, symbol: string): any {}

  private _GetWalletBalance(
    accountType: AccountTypeV5,
    coins: string,
  ): Promise<any> {
    return this.client.getWalletBalance({ accountType, coin: coins });
  }

  getWalletBalance(accountType: string, coins: string): any {
    return this._GetWalletBalance(accountType as AccountTypeV5, coins);
  }

  placeOrder(
    category: CategoryV5,
    symbol: string,
    orderType: OrderTypeV5,
    quantity: string,
    side: OrderSideV5,
    price: string,
  ): any {}

  getServerTime(): Promise<any> {
    return this.client.getServerTime();
  }
}
