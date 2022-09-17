export enum ERROR_MESSAGES {
  USER_NOT_FOUND = 'user_not_found',
  MESSAGES_NOT_FOUND = 'messages for dialog not found',
  RECEIVER_NOT_FOUND = 'receiver not found',
  INVALID_DATA = 'invalid data',
  TEXT_MESSAGE_NOT_FOUND = 'message text is required',
  SEND_MESSAGE_ERROR = 'send message error',
  DIALOG_NOT_FOUND = 'dialog not found',
  QUERY_STRING_IS_EMTY = 'query string can not be empty',
  REGISTER_ERROR = 'register error',
  ALL_INPUT_IS_REQUIRED = 'All input is required',
  USER_ALREADY_EXISTS = 'User already exists',
  TOKEN_REQUIRED = 'You did not pass auth token!',
  OLD_PASSWORD_INVALID = 'Old password is invalid',
  NEW_PASSWORD_IS_REQUIRED = 'New password is required',
  NEW_PASSWORD_MUST_BE_DIFFERENT_FROM_OLD = 'New password must be different from old',
  INVALID_TOKEN = 'Invalid token',
  UNEXPECTED_ERROR = 'unexpected server error',
  FILE_IS_REQUIRED = 'file is required',
}
