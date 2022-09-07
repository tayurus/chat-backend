import { RegisterUserSuccessResponse } from '../types/backendResponses';

export type RegisteredUserForTest = RegisterUserSuccessResponse & { token: string };
