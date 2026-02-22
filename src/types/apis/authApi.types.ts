export interface UserInfo {
  userId: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  user: UserInfo;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: UserInfo & { createdAt: string };
}
