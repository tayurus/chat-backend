import { UpdateUserPasswordParams } from 'src/types/backendParams';
import { RegisteredUsersForTest } from 'src/tests/helpersForTests/getTokenForCookieForTest';

export async function updateUserPasswordForTest(params: {
  data: UpdateUserPasswordParams;
  expectedStatus?: number;
  registeredUsers: RegisteredUsersForTest;
}) {
  const { data, expectedStatus = 200 } = params;
}
