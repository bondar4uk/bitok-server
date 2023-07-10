export class INFORMATION {}

export class SUCCESS {
  static OK = 200;
}

export class REDIRECTION {}

export class CLIENT_ERROR {
  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static FORBIDDEN = 403;
  static PROXY_AUTHENTICATION_REQUIRED = 407;
  static REQUEST_TIMEOUT = 408;
  static CONFLICT = 409;
  static TOO_MANY_REQUESTS = 429;
}

export class SERVER_ERROR {
  static INTERNAL_SERVER_ERROR = 500;
  static BAD_GATEWAY = 502;
  static GATEWAY_TIMEOUT = 504;
}

export class RESULT_CODE {
  static SUCCESS = SUCCESS;
  static CLIENT_ERROR = CLIENT_ERROR;
  static SERVER_ERROR = SERVER_ERROR;
}
