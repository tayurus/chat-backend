import { CookieOptions, Express } from 'express';

export interface TypedRequestBody<BodyParams = {}, QueryParams = {}, UrlParams = {}> extends Express.Request {
  body: BodyParams;
  cookies: Record<string, string>;
  query: QueryParams;
  params: UrlParams;
  user: { user_id: string; email: string; first_name: string; last_name: string; profilePhoto: string };
  file?: Express.Multer.File;
}

export type TypedResponse<T = undefined> = Omit<Express.Response, 'json' | 'status'> & { send(data: T): TypedResponse<T> } & {
  status(code: number): TypedResponse<T>;
  json(data: T): TypedResponse<T>;
  cookie(key: string, value: string, options?: CookieOptions): void;
  sendFile(fileName: string): void;
};
