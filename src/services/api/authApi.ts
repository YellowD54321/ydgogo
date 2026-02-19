const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function postJson<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? 'Unknown error');
  }

  return data as T;
}

export function googleLogin(idToken: string): Promise<LoginResponse> {
  return postJson<LoginResponse>('/login/googleOauth', { idToken });
}

export function googleRegister(idToken: string): Promise<RegisterResponse> {
  return postJson<RegisterResponse>('/register/googleOauth', { idToken });
}

/**
 * 自動登入/註冊：先嘗試登入，若 404（未註冊）則自動註冊後再登入。
 */
export async function googleLoginOrRegister(idToken: string): Promise<LoginResponse> {
  try {
    return await googleLogin(idToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      await googleRegister(idToken);
      return await googleLogin(idToken);
    }
    throw error;
  }
}
