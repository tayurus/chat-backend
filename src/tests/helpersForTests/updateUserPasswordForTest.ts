import { UpdateUserPasswordParams } from 'src/types/backendParams';
import { RegisteredUsersForTest } from 'src/tests/helpersForTests/getTokenForCookieForTest';

/**
 * Менят пароль для теста
 * @param requesterEmail - емейл пользователя, от лица которого совершаем запрос
 * */
export async function updateUserPasswordForTest(params: {
  data: UpdateUserPasswordParams;
  expectedStatus?: number;
  requesterEmail: string;
  registeredUsers: RegisteredUsersForTest;
}) {
  const { data, expectedStatus = 200, requesterEmail } = params;
}
