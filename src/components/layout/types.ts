export type User = {
  id: string;
  name: string;
};

export type BoardLite = {
  id: string;
  name: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};