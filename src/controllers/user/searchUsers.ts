import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import { User, UserType } from 'src/model/user';
import { SearchUsersQueryParams } from 'src/types/backendParams';
import { searchByFields } from 'src/utils/search';
import { SearchUsersResponse } from 'src/types/backendResponses';
import { normalizeFoundedUser } from 'src/utils/user';

export const searchUsers = async (req: TypedRequestBody<{}, SearchUsersQueryParams>, res: TypedResponse<SearchUsersResponse>) => {
  const {
    query: { query: searchQuery },
  } = req;

  if (!searchQuery) {
    return res.status(400).send(ERROR_MESSAGES.QUERY_STRING_IS_EMTY);
  }

  const userFieldsForReturn: Array<keyof UserType | '_id'> = ['first_name', 'last_name', '_id'];

  const searchResults: SearchUsersResponse = (
    await searchByFields<UserType>(User, ['first_name', 'last_name'], searchQuery, userFieldsForReturn)
  ).map(normalizeFoundedUser);

  return res.status(200).send(searchResults);
};
