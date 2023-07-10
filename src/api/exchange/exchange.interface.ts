import { CategoryV5, OrderSideV5, OrderTypeV5 } from 'bybit-api';
import * as z from 'zod';
import { EXCHANGES } from '../../constants/DBTypes';
import { VALIDATOR_CONTAINER } from '../../types/controllerTypes';
import { EXCHANGE } from '../../constants/paths';

export class ACCOUNT_INFO_SCHEMA {
  exchange: string;
  isLiveNet: boolean;
}

export class ACCOUNT_INFO_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      exchange: z.enum(EXCHANGES),
      isLiveNet: z.boolean(),
    })
    .strict();
}

export class TWOFA_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      code: z.string(),
    })
    .strict();
}

//==============================================================================

export class Credentials {
  api: string;
  secret: string;
  isLiveNet: boolean;
  exchange: EXCHANGE;

  constructor(
    api: string,
    secret: string,
    isLiveNet: boolean,
    exchange: EXCHANGE,
  ) {
    this.api = api;
    this.secret = secret;
    this.isLiveNet = isLiveNet;
    this.exchange = exchange;
  }
}

export abstract class AExchange {
  protected abstract credentials: Credentials;
  protected constructor(credentials: Credentials) {
    this['credentials'] = credentials;
  }

  abstract getServerTime(): Promise<any>;

  abstract getAccountInfo(): Promise<any>;

  abstract getWalletBalance(accountType: string, coins: string): Promise<any>;

  abstract placeOrder(
    category: CategoryV5,
    symbol: string,
    orderType: OrderTypeV5,
    quantity: string,
    side: OrderSideV5,
    price: string,
  ): Promise<any>;

  abstract closeOrder(
    category: CategoryV5,
    symbol: string,
    orderId: string,
  ): Promise<any>;

  abstract getPositionInfo(category: CategoryV5, symbol: string): Promise<any>;
}
