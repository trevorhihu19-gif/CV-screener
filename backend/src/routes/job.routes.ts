import { Router } from "express";
import {
    createJob,
    getJobs,
    getJobById,
    deleteJob
} from "../controllers/job.controller.js"
import { protect } from "../middlewares/auth.middleware.js";

const JobRouter = Router();

JobRouter.use(protect);

JobRouter.post("/", createJob);
JobRouter.get("/", getJobs);
JobRouter.get("/:id", getJobById);
JobRouter.delete("/:id", deleteJob);

export default JobRouter;