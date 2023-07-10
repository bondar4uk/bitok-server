export class RESPONSE_MESSAGE {
  static ERROR_USER_EXISTS = (email: string) => `User ${email} already exists.`;
  static ERROR_USER_DOES_NOT_EXIST = (email: string) =>
    `User ${email} doesn't exist.`;
  static ERROR_INVALID_PASSWORD = () => `Invalid password.`;
  static PASSWORDS_MATCH = () => 'Passwords match.';
  static NAMES_MATCH = () => 'Names match.';
  static UNCAUGHT_EXCEPTION = () => `Uncaught exception.`;
  static ERROR_INVALID_TOKEN = () => `Invalid token.`;
  static ERROR_INVALID_VALUE = (val: string) => `Invalid '${val}' value.`;
  static ERROR_NO_KEYS_EXIST = () =>
    `No keys exist for this type of exchange and Net.`;

  static ERROR_CODE_EXPIRED = () => `The code has expired.`;
  static ERROR_TOO_MANY_REQUESTS = () => `Too many code request attempts.`;
  static ERROR_CODE_WRONG = () => `The code provided is incorrect.`;
  static ERROR_PERMISSION_RESTRICTED = () =>
    `Your account doesn't have permissions for this request.`;
  static ACCOUNT_DELETED = (email: string) =>
    `Account with email ${email} has been deleted.`;
  static PASSWORD_CHANGED_SUCCESS = (email: string) =>
    `Password for account with email ${email} changed successfully.`;
  static NAME_CHANGED_SUCCESS = (email: string) =>
    `Name for account with email ${email} changed successfully.`;
  static PASSWORD_RESET_SUCCESS = (email: string) =>
    `Password for account with email ${email} has been successfully reset.`;
  static PASSWORD_RESET_CODE_VALID = () => `The password reset code is valid.`;

  static TWO_FACTOR_ALREADY_DISABLED = () =>
    `Two-Factor Authentication (2FA) is already disabled for this account.`;
  static TWO_FACTOR_DISABLED_SUCCESS = () =>
    `Two-Factor Authentication (2FA) has been successfully disabled.`;
  static TWO_FACTOR_CURRENTLY_DISABLED = () =>
    `Two-Factor Authentication (2FA) is currently disabled for this account. Please enable it for added security.`;
  static TWO_FACTOR_AUTHENTICATION_SUCCESS = () =>
    `The 2FA code is correct. Authentication successful.`;
  static TWO_FACTOR_AUTHENTICATION_FAILURE = () =>
    `Invalid 2FA code. Please enter a valid verification code.`;

  static LOGOUT_SUCCESSFUL = () =>
    `Logout successful. You have been successfully logged out of your account.`;
  static USER_SUCCESSFULLY_REGISTERED = (email: string) =>
    `User with the email address '${email}' has been successfully registered.`;

  static USER_ENTERED_SYSTEM = (email: string, isAdmin: boolean) =>
    `${isAdmin ? 'Admin' : 'User'} {${email}} has entered the system.`;
  static USER_LOGGED_OUT = (email: string, isAdmin: boolean) =>
    `${isAdmin ? 'Admin' : 'User'} {${email}} has logged out.`;
  static EMAIL_SENT_SUCCESSFULLY = () => `Email has been successfully sent.`;
}
