import { UserTyping } from 'src/types/backendAndFrontendCommonTypes/userTyping';

export enum WebSocketsEvents {
  NEW_MESSAGE = 'NEW_MESSAGE',
  USER_UPDATE = 'USER_UPDATE',
  USER_TYPING = 'USER_TYPING',
}

export type WebSocketMessage<T extends Record<string, any>> = {
  type: WebSocketsEvents;
  data: T;
};

export type UserInfoInDialog = {
  last_name: string;
  first_name: string;
  id: string;
  profilePhoto: string;
  online?: boolean;
};
export type DialogInResponse = {
  messages: FoundedMessage[];
  participants: UserInfoInDialog[];
  id: string;
};

export type GetDialogsSuccessResponse = Array<DialogInResponse>;
export type GetDialogsResponse = Array<DialogInResponse> | string;

export type RegisterUserSuccessResponse = {
  first_name: string;
  last_name: string;
  email: string;
  profilePhoto: string;
  id: string;
};
export type RegisterUserResponse = string | RegisterUserSuccessResponse;

export type LoginSuccessResponse = {
  first_name: string;
  last_name: string;
  email: string;
  profilePhoto: string;
  id: string;
};
export type LoginUserResponse = string | LoginSuccessResponse;

export type SendMessageSuccessResponse = { dialogId: string };
export type SendMessageResponse = string | { dialogId: string };

export type FoundedUser = {
  first_name: string;
  last_name: string;
  id: string;
  profilePhoto: string;
};

export type SearchUsersResponse = string | Array<FoundedUser>;
export type SearchUsersSuccessResponse = Array<FoundedUser>;

export type FoundedMessage = {
  from: string;
  content: string;
  datetime: number;
  id: string;
};
export type GetDialogSuccessResponse = DialogInResponse;
export type GetDialogResponse = string | DialogInResponse;

export type WhoAmISuccessResponse = {
  first_name: string;
  last_name: string;
  email: string;
  profilePhoto: string;
  id: string;
};
export type WhoAmIResponse = string | WhoAmISuccessResponse;

export type WsNewMessageResponse = {
  dialogId: string;
  participants?: UserInfoInDialog[];
  message: FoundedMessage;
};

export type WsUserUpdatedResponse = {
  userId: string;
  changes: Partial<UserInfoInDialog>;
};

export type WsUserTypingResponse = {
  userId: string;
  typingType: UserTyping;
  dialogId: string;
};

export type UpdateUserPasswordResponse = {};

export type UploadFileSuccessResponse = { url: string };
export type UploadFileResponse = string | UploadFileSuccessResponse;
