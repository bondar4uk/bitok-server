import { VALIDATOR_CONTAINER } from '../types/controllerTypes';
import * as z from 'zod';
import {
  NAME_VALIDATION,
  PASSWORD_VALIDATION,
} from '../interfaces/validations';

export class ACCOUNT_DELETE_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      password: PASSWORD_VALIDATION,
    })
    .strict();
}

export class PASSWORD_CHANGE_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      current_password: PASSWORD_VALIDATION,
      new_password: PASSWORD_VALIDATION,
    })
    .strict();
}

export class NAME_CHANGE_BODY implements VALIDATOR_CONTAINER {
  static VALIDATOR = z
    .object({
      new_name: NAME_VALIDATION,
    })
    .strict();
}
