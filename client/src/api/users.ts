import { apiClient } from './client';

export interface UserResponse {
  id: string;
  displayName: string;
  email: string;
  role: string;
}

export interface CreateUserRequest {
  displayName: string;
  email: string;
  password: string;
  role: string;
}

/** Возвращает пользователей и позволяет администратору управлять ими. */
export const usersApi = {
  list: () => apiClient.get<UserResponse[]>('/api/users'),
  create: (data: CreateUserRequest) => apiClient.post<UserResponse>('/api/users', data),
  updateRole: (id: string, role: string) =>
    apiClient.put<UserResponse>(`/api/users/${id}/role`, { role }),
  remove: (id: string) => apiClient.delete<void>(`/api/users/${id}`),
};
