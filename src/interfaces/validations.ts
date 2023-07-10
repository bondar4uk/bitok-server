import * as z from 'zod';

const letterRegex = /[a-zA-Z]/;
const digitRegex = /[0-9]/;
const alphanumericRegex = /^[a-zA-Z0-9]+$/;

export const EMAIL_VALIDATION = z
  .string()
  .email('Provided data is not in the email format');
export const PASSWORD_VALIDATION = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(20, 'Password must not exceed 20 characters')
  .regex(letterRegex, 'Password must contain at least one letter')
  .regex(digitRegex, 'Password must contain at least one digit')
  .regex(alphanumericRegex, 'Password must contain only letters and numbers');

export const CODE_VALIDATION = z
  .string()
  .min(8, 'Code must be at least 8 characters long')
  .max(50, 'Code must not exceed 50 characters')
  .regex(letterRegex, 'Code must contain at least one letter')
  .regex(digitRegex, 'Code must contain at least one digit')
  .regex(alphanumericRegex, 'Code must contain only letters and numbers');

export const NAME_VALIDATION = z
  .string()
  .min(3, 'Name must be at least 3 characters long')
  .max(20, 'Name must not exceed 20 characters')
  .regex(letterRegex, 'Name must contain at least one letter')
  .regex(digitRegex, 'Name must contain at least one digit')
  .regex(
    /^[a-zA-Z0-9_\- ]+$/,
    'Name must contain only letters, numbers, underscore, hyphen, and spaces',
  );

export const CODE_2FA = z
  .string()
  .length(8)
  .regex(/^\d+$/, '2FA Code must contain only numbers');
