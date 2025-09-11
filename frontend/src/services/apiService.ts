import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://utasks-026af75f15a3.herokuapp.com/api/",
  withCredentials: false,
});

const api = {
  get: async <T>(endpoint: string) => (await apiClient.get<T>(endpoint)).data,
  post: async <T>(endpoint: string, body?: any) => (await apiClient.post<T>(endpoint, body)).data,
  put: async <T>(endpoint: string, body?: any) => (await apiClient.put<T>(endpoint, body)).data,
  delete: async <T>(endpoint: string, body?: any) => (await apiClient.delete<T>(endpoint, { data: body })).data,
  login: async (id: string) => (await apiClient.get(`users/${id}`)).data
};

export default api;