const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchJson<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: defaultHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? 'Unknown error');
  }

  return data as T;
}

export function fetchWithAuth<T>(
  method: string,
  endpoint: string,
  token: string,
  body?: unknown,
): Promise<T> {
  return fetchJson<T>(method, endpoint, body, {
    Authorization: `Bearer ${token}`,
  });
}
