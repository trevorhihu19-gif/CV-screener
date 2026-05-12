export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Job {
    _id: string;
    title: string;
    description: string;
    requirements: string[];
    createdBy: string;
    createdAt: string;
}

export interface Candidate {
    _id: string;
    jobId: string;
    name: string;
    email: string;
    cvPath: string;
    matchScore: number;
    skillBreakdown: SkillScore[];
    aiSummary: string;
    status: "pending" | "shortlisted" | "reviewing" | "rejected";
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}