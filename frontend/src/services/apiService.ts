import axios from "axios";
const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: false,
});

const api = {
  get: async <T>(endpoint: string) => (await apiClient.get<T>(endpoint)).data,
  post: async <T>(endpoint: string, body?: any) => (await apiClient.post<T>(endpoint, body)).data,
  put: async <T>(endpoint: string, body?: any) => (await apiClient.put<T>(endpoint, body)).data,
  delete: async <T>(endpoint: string, body?: any) => (await apiClient.delete<T>(endpoint, { data: body })).data,
  login: async (username: string, password: string) => {return await apiClient.post('/users/login', { username, password });}
};

export default api;