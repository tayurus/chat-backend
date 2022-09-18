export enum BASE_ROUTES {
  USER = '/user',
  MESSAGE = '/message',
  DIALOG = '/dialog',
  FILE = '/file',
}

export enum USER_ROUTES {
  REGISTER = '/register',
  LOGIN = '/login',
  SEARCH_USERS = '/search',
  WHO_AM_I = '/whoAmI',
  UPDATE_PASSWORD = '/updatePassword',
}

export enum MESSAGE_ROUTES {
  SEND = '/send',
}

export enum DIALOG_ROUTES {
  GET_DIALOGS = '/dialogs',
  GET_BY_ID = '/:dialogId',
}

export enum FILE_ROUTES {
  UPLOAD = '/upload',
  GET = '/:filename',
  UPLOAD_STORAGE = '/uploads',
}
