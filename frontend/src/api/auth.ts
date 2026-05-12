import { api } from "./axios.ts";
import type { ApiResponse, AuthResponse } from "../types/index.ts";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> => {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};
