import express from 'express';
import cors from "cors";
import { PORT } from './config/env.js';
import { connectToDB } from './config/database.js';
import { arcjetProtect } from './middlewares/arcjet.auth.middleware.js';
import authRouter from './routes/auth.routes.js';
import JobRouter from './routes/job.routes.js';
import candidateRouter from './routes/candidate.routes.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.urlencoded({ extended: false}));

app.use(arcjetProtect);

app.use("/api/auth", authRouter);
app.use("/api/jobs", JobRouter);
app.use("/api/candidates", candidateRouter);

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});