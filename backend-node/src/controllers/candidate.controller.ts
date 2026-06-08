import { Response } from "express";
import Candidate from "../models/candidate.js";
import Job from "../models/job.js";
import { AuthRequest, ApiResponse } from "../types/index.js";
import { screenCV } from "../utils/claude.js";

export const uploadCv = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { name, email } = req.body;

    const job = await Job.findOne({
      _id: jobId,
      createdBy: req.user?.id,
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      } as ApiResponse<null>);
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please upload a CV file",
      } as ApiResponse<null>);
      return;
    }

    const screeningResult = await screenCV(
      req.file.path,
      job.title,
      job.description,
      job.requirements,
    );

    const candidate = await Candidate.create({
      jobId: jobId as string,
      name: name as string,
      email: email as string,
      cvPath: req.file.path,
      matchScore: screeningResult.matchScore,
      skillBreakdown: screeningResult.skillBreakdown,
      aiSummary: screeningResult.aiSummary,
      status: screeningResult.status,
    });

    res.status(201).json({
      success: true,
      message: "CV uploaded and screened successfully",
      data: candidate,
    } as ApiResponse<object>);
  } catch (error) {
    console.error("upload error:", error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error during CV upload",
    } as ApiResponse<null>);
  }
};

export const getCandidateByJob = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({
      _id: jobId,
      createdBy: req.user?.id,
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      } as ApiResponse<null>);
      return;
    }

    const candidates = await Candidate.find({ jobId }).sort({
      matchScore: -1,
    });

    res.status(200).json({
      success: true,
      message: "Candidates fetched successfully",
      data: candidates,
    } as ApiResponse<object>);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching candidates",
    } as ApiResponse<null>);
  }
};

export const getCandidateById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate(
      "jobId",
      "title description",
    );

    if (!candidate) {
      res.status(400).json({
        success: false,
        message: "Candidate not found",
      } as ApiResponse<null>);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Candidate fetched successfully",
      data: candidate,
    } as ApiResponse<object>);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sever error fetching candidates",
    } as ApiResponse<null>);
  }
};

export const updateCandidateStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "shortlisted", "reviewing", "rejected"];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status value",
      } as ApiResponse<null>);
      return;
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!candidate) {
      res.status(404).json({
        success: false,
        message: "Candidate not found",
      } as ApiResponse<null>);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Candidate status updated successfully",
      data: candidate,
    } as ApiResponse<object>);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error updating candidate status",
    } as ApiResponse<null>);
  }
};

export const deleteCandidate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      res.status(404).json({
        success: false,
        message: "Candidate not found",
      } as ApiResponse<null>);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
      data: candidate,
    } as ApiResponse<null>);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error deleting candidate",
    } as ApiResponse<null>);
  }
};
