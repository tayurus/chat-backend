import { RegisteredUserForTest } from '../typesForTests';

export type RegisteredUsersForTest = Record<string, RegisteredUserForTest>;
export function getTokenForCookieForTest({ registeredUsers, email }: { registeredUsers: RegisteredUsersForTest; email: string }) {
  return [`token=${registeredUsers[email].token}`];
}
