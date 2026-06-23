import api from "./axios.ts";
import type {
  ApiResponse,
  Candidate,
  BulkUploadResponse,
} from "../types/index.ts";

export const uploadCV = async (
  jobId: string,
  formData: FormData,
): Promise<ApiResponse<Candidate>> => {
  const res = await api.post(`candidates/upload/${jobId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const bulkUploadCVs = async (
  jobId: string,
  files: File[],
): Promise<ApiResponse<BulkUploadResponse>> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  const res = await api.post(
    `/candidates/jobs/${jobId}/candidates/bulk-upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

export const getCandidateByJob = async (
  jobId: string,
): Promise<ApiResponse<Candidate[]>> => {
  const res = await api.get(`/candidates/${jobId}`);
  return res.data;
};

export const getCandidateById = async (
  id: string,
): Promise<ApiResponse<Candidate>> => {
  const res = await api.get(`/candidates/single/${id}`);
  return res.data;
};

export const updateCandidateStatus = async (
  id: string,
  status: string,
): Promise<ApiResponse<Candidate>> => {
  const res = await api.patch(`candidates/${id}/status`, { status });
  return res.data;
};

export const deleteCandidate = async (
  id: string,
): Promise<ApiResponse<Candidate>> => {
  const res = await api.delete(`candidates/${id}`);
  return res.data;
};
