import mongoose, { Schema, Document } from "mongoose";

export interface SkillScore {
  skill: string;
  score: number;
}

export interface CandidateDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  cvPath: string;
  matchScore: number;
  skillBreakdown: SkillScore[];
  aiSummary: string;
  status: "pending" | "shortlisted" | "reviewing" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const SkillScoreSchema = new Schema<SkillScore>({
  skill: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
});

const CandidateSchema = new Schema<CandidateDocument>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "job",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    cvPath: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    skillBreakdown: {
      type: [SkillScoreSchema],
      default: [],
    },
    aiSummary: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "reviewing", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model<CandidateDocument>("Candidate", CandidateSchema);
