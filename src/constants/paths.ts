export class ORDER {
  static SELF = 'order';
  static FULL = () => TRADE.FULL() + this.SELF;
}

export class TRADE {
  static SELF = 'trade';
  static FULL = () => API.FULL() + this.SELF;
  static ORDER = ORDER;
}

export class EXCHANGE {
  static SELF = 'exchange';
  static FULL = () => API.SELF + '/' + this.SELF;
  static ACCOUNT_INFO = 'account-info';
  static BALANCE = 'balance';
}

export class API {
  static SELF = 'api';
  static FULL = () => PATH.SELF + this.SELF;
  static TRADE = TRADE;
  static EXCHANGE = EXCHANGE;
  static PROXY = `proxy`;
}

export class FORGOT_PASSWORD {
  static SELF = 'forgot-password';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class RESET_PASSWORD {
  static SELF = 'reset-password/:email/:token';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class AUTH {
  static SELF = 'auth';
  static FULL = () => PATH.SELF + this.SELF;
  static REGISTER = 'register';
  static LOGIN = 'login';
  static LOGOUT = 'logout';
  static FORGOT_PASSWORD = FORGOT_PASSWORD;
  static RESET_PASSWORD = RESET_PASSWORD;
}

export class WALLET {
  static SELF = 'wallet';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class ORDER_BOOK {
  static SELF = 'order-book';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class USER_DATA {
  static SELF = 'user';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class CHANGE_PASSWORD {
  static SELF = 'change-password';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class CHANGE_NAME {
  static SELF = 'change-name';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class DELETE_ACCOUNT {
  static SELF = 'delete-account';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class TWOFA {
  static SELF = '2fa/:enable';
  static FULL = () => ACCOUNT.FULL() + this.SELF;
}

export class ACCOUNT {
  static SELF = 'account';
  static FULL = () => PATH.SELF + ACCOUNT.SELF;
  static WALLET = WALLET;
  static ORDER_BOOK = ORDER_BOOK;
  static USER_DATA = USER_DATA;
  static CHANGE_PASSWORD = CHANGE_PASSWORD;
  static CHANGE_NAME = CHANGE_NAME;
  static DELETE_ACCOUNT = DELETE_ACCOUNT;
  static TWOFA = TWOFA;
}

export class PATH {
  static SELF = '';
  static API = API;
  static AUTH = AUTH;
  static ACCOUNT = ACCOUNT;
}
