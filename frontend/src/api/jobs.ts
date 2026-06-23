import api from "./axios.ts";
import type { ApiResponse, Job } from "../types/index.ts";

export const createJob = async (
  title: string,
  description: string,
  requirements: string[],
): Promise<ApiResponse<Job>> => {
  const res = await api.post("/jobs", { title, description, requirements });
  return res.data;
};

export const getJobs = async (): Promise<ApiResponse<Job[]>> => {
  const res = await api.get("/jobs");
  return res.data;
};

export const getJobById = async (id: string): Promise<ApiResponse<Job>> => {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
};

export const deleteJob = async (id: string): Promise<ApiResponse<Job>> => {
  const res = await api.delete(`/jobs/${id}`);
  return res.data;
};
