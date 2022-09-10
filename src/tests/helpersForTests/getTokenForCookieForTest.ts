import { RegisteredUserForTest } from 'src/tests/typesForTests';

export type RegisteredUsersForTest = Record<string, RegisteredUserForTest>;
export function getTokenForCookieForTest({ registeredUsers, email }: { registeredUsers: RegisteredUsersForTest; email: string }) {
  return [`token=${registeredUsers[email].token}`];
}
