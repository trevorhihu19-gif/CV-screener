import mongoose, { Schema, Document} from "mongoose";

export interface JobDocument extends Document {
    title : string;
    description : string;
    requirements: string[];
    createdBy: mongoose.Types.ObjectId,
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<JobDocument>(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Job description is required"],
        },
        requirements: {
            type: [String],
            default: [],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<JobDocument>("Job", JobSchema);