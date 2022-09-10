import { RegisterUserSuccessResponse } from 'src/types/backendResponses';

export type RegisteredUserForTest = RegisterUserSuccessResponse & { token: string };
