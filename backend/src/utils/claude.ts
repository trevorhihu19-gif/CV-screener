import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import { SkillScore } from "../models/candidate.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ScreeningResult {
    matchScore: number;
    skillBreakdown: SkillScore[];
    aiSummary: string;
    status: "shortlisted" | "reviewing" | "rejected";
}


export const screenCV = async (
  cvPath: string,
  jobTitle: string,
  jobDescription: string,
  requirements: string[]
): Promise<ScreeningResult> => {
  const mockResult: ScreeningResult = {
    matchScore: 78,
    skillBreakdown: [
      { skill: requirements[0] || "Technical Skills", score: 85 },
      { skill: requirements[1] || "Experience", score: 75 },
      { skill: requirements[2] || "Communication", score: 70 },
    ],
    aiSummary: `Candidate shows strong alignment with the ${jobTitle} role. Good technical background with relevant experience. Recommended for further review.`,
    status: "shortlisted",
  };

  return mockResult;
};
