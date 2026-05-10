import { Response } from "express";
import { ApiResponse, AuthRequest } from "../types/index.js";
import Job from "../models/job.js";

export const createJob = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try{
        const { title, description, requirements} = req.body;
        const job = await Job.create({
            title,
            description,
            requirements,
            createdBy: req.User?.id,
        });

        res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: job,
        } as ApiResponse<object>);
    }catch(error) {
        res.status(500).json({
            success: false,
            message: "Server error creating job",
        } as ApiResponse<null>)
    }
};

export const getJobs = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try{
        const jobs = await Job.find({ createdBy: req.User?.id}).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs,
        } as ApiResponse<null>);
    }catch(error) {
        res.status(500).json({
            success: false,
            message: "error fetching jobs",
        } as ApiResponse<null>)
    }
};

export const getJobById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try{
        const job = await Job.findOne({
            _id: req.params.id,
            createdBy: req.User?.id
        });

        if(!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            } as ApiResponse<null>);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: job
        } as ApiResponse<object>)
    }catch(error) {
        res.status(500).json({
            success: false,
            message: " error fetching job"
        } as ApiResponse<null>)
    }
};

export const deleteJob = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try{
        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.User?.id,
        });

        if(!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            } as ApiResponse<null>);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        } as ApiResponse<null>)
    }catch(error) {
        res.status(500).json({
            success: false,
            message: "error deleting Job"
        } as ApiResponse<null>);
    }
};