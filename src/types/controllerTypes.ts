import { ZodObject } from 'zod';

export class RESPONSE {
  CODE: number;
  DATA?: any;
}

export class VALIDATOR_CONTAINER {
  static VALIDATOR: ZodObject<any>;
}
