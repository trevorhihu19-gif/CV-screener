export interface User {
    id: string;
    name: string;
    email: string;
    created_at?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    created_by: string;
    created_at: string;
}

export interface SkillScore{
    name?: string;
    skill?: string;
    score: number,
}

export interface Candidate {
    id: string;
    job_id: string;
    name: string;
    email: string;
    cv_path: string;
    match_score: number;
    skill_breakdown: SkillScore[];
    ai_summary: string;
    status: "pending" | "shortlisted" | "reviewing" | "rejected";
    created_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface BulkUploadResult {
    id: string;
    name: string;
    email: string;
    match_score: number;
    status: string;
    ai_summary: string;
    recommendation: string;
}

export interface BulkUploadResponse {
    total: number;
    candidates: BulkUploadResult[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface sendMessageParams {
    message: string;
    job_id?: string;
}

export interface ChatResponse {
    response: string;
}