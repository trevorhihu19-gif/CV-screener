import { Request } from "express";

export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export interface Job {
    _id: string;
    title: string;
    description: string;
    requirements: string[];
    createdBy: string;
    createdAt: Date;
}

export interface Candidate {
    _id: string;
    jobId: string;
    name: string;
    email: string;
    cvPath : string;
    matchScore: number;
    skillBreakdown: SkillScore[];
    aiSummary: string;
    status: "pending" | "shortlisted" | "reviewing" | "rejected";
    createdAt: Date;
}

export interface SkillScore {
    skill: string;
    score: number;
}

export interface ApiResponse {
    success: boolean;
    message: string;
}