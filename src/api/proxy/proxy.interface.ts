import { VALIDATOR_CONTAINER } from '../../types/controllerTypes';
import * as z from 'zod';

export class PROXY_BODY extends VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      host: z.string().ip({ version: 'v4' }),
      port: z.number().min(0).max(65535),
      user: z.string(),
      password: z.string(),
    })
    .strict();
}
