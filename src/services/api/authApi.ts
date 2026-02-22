import { LoginResponse, RegisterResponse } from '@/types/apis/authApi.types';
import { ApiError, fetchJson } from './common/apiClient';

export function googleLogin(idToken: string): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('POST', '/login/googleOauth', { idToken });
}

export function googleRegister(idToken: string): Promise<RegisterResponse> {
  return fetchJson<RegisterResponse>('POST', '/register/googleOauth', { idToken });
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
