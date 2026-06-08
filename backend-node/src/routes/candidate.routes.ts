import { Router } from "express";
import {
    uploadCv,
    getCandidateByJob,
    getCandidateById,
    updateCandidateStatus,
    deleteCandidate
 } from "../controllers/candidate.controller.js";
 import { protect } from "../middlewares/auth.middleware.js";
 import { upload } from "../middlewares/upload.middleware.js";

 const candidateRouter = Router();

 candidateRouter.use(protect);

 candidateRouter.post("/upload/:jobId", upload.single("cv"), uploadCv);
 candidateRouter.get("/:jobId", getCandidateByJob);
 candidateRouter.get("/single/:id", getCandidateById);
 candidateRouter.patch("/:id/status", updateCandidateStatus);
 candidateRouter.delete("/:id", deleteCandidate);

 export default candidateRouter;