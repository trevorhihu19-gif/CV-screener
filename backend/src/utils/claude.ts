import Groq from "groq-sdk";
import fs from "fs";
import PDFParser from "pdf2json";
import { GROQ_API_KEY } from "../config/env.js";
import { SkillScore } from "../models/candidate.js";

const groq = new Groq({ apiKey: GROQ_API_KEY });

const extractTextFromPDF = (cvPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" "),
      ).join("\n");
      resolve(text);
    });

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err);
    });

    pdfParser.loadPDF(cvPath);
  });
};

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
  requirements: string[],
): Promise<ScreeningResult> => {
  const cvText = await extractTextFromPDF(cvPath);

  const prompt = `You are an expert recruiter and CV screener.

Analyze the CV text below against the job requirements and respond with ONLY a valid JSON object — no markdown, no backticks, no extra text.

Job Title: ${jobTitle}

Job Description: ${jobDescription}

Requirements: ${requirements.join(", ")}

CV Content:
${cvText}

Respond with exactly this JSON structure:
{
  "matchScore": <number 0-100>,
  "skillBreakdown": [
    { "skill": "<skill name>", "score": <number 0-100> },
    { "skill": "<skill name>", "score": <number 0-100> },
    { "skill": "<skill name>", "score": <number 0-100> }
  ],
  "aiSummary": "<2-3 sentence plain English summary of the candidate fit>",
  "status": "<shortlisted if matchScore >= 75, reviewing if matchScore >= 50, rejected if matchScore < 50>"
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const rawText = response.choices[0]?.message?.content || "";
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const result: ScreeningResult = JSON.parse(cleaned);

  return result;
};
