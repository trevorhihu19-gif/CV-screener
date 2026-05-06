import express from 'express';
import { PORT } from './config/env.js';
import { connectToDB } from './config/database.js';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.use("/api/auth", authRouter);

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});