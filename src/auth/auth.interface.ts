import {
  CODE_2FA,
  CODE_VALIDATION,
  EMAIL_VALIDATION,
  NAME_VALIDATION,
  PASSWORD_VALIDATION,
} from 'src/interfaces/validations';
import * as z from 'zod';
import { VALIDATOR_CONTAINER } from '../types/controllerTypes';

export class EMAIL implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      email: EMAIL_VALIDATION,
    })
    .strict();
}

export class LOGIN_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      code_2fa: CODE_2FA.optional(),
      email: EMAIL_VALIDATION,
      password: PASSWORD_VALIDATION,
    })
    .strict();
}

export class REGISTER_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      name: NAME_VALIDATION,
      email: EMAIL_VALIDATION,
      password: PASSWORD_VALIDATION,
      code: CODE_VALIDATION.optional(),
    })
    .strict();
}

export class PASSWORD_RESET_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      new_password: PASSWORD_VALIDATION,
    })
    .strict();
}
