const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5051';

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Все HTTP-запросы проходят через одну точку, чтобы токен и обработка ошибок работали одинаково.
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const problem: ProblemDetails = await response.json();
      message = problem.detail ?? problem.title ?? message;
    } catch {
      // Если сервер не прислал JSON, оставляем стандартное сообщение по статусу.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

/** Собирает query string без пустых значений. */
/** Собирает query string без пустых значений. */
export function buildQuery(params: object): string {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }

  const value = qs.toString();
  return value ? `?${value}` : '';
}

export const apiClient = {
  // Короткие типизированные обертки позволяют страницам думать о действиях, а не о деталях fetch.
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
