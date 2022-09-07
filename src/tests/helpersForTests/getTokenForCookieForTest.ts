import { RegisteredUserForTest } from '../typesForTests';

export function getTokenForCookieForTest({ registeredUsers, email }: { registeredUsers: Record<string, RegisteredUserForTest>; email: string }) {
  return [`token=${registeredUsers[email].token}`];
}
