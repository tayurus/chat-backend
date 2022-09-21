import { LoginUserBodyParams, RegisterUserBodyParams } from 'src/types/backendParams';
import path from 'path';

export const REGISTER_SUCCESS_INPUT_DATA: RegisterUserBodyParams = { first_name: 'Yuriy', last_name: 'Tatar', email: 'sooqa@mail.ru', password: '1' };
export const REGISTER_SUCCESS_INPUT_DATA2: RegisterUserBodyParams = {
  first_name: 'Sergio',
  last_name: 'Koval',
  email: 'serg@zerg.ru',
  password: '2',
};

export const LOGIN_SUCCESS_INPUT_DATA: LoginUserBodyParams = {
  email: REGISTER_SUCCESS_INPUT_DATA.email,
  password: REGISTER_SUCCESS_INPUT_DATA.password,
};

export const TEST_FILE_PATH_FOR_UPLOAD = path.join('./src/tests/assets/imageForUpload.png');
export const TEST_TOO_BIG_FILE_PATH_FOR_UPLOAD = path.join('./src/tests/assets/tooBigImage.jpg');
export const TEST_INVALID_FILE_PATH_FOR_UPLOAD = path.join('./src/tests/assets/invalidFileTypeForUpload.csv');
