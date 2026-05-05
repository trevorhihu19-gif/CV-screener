import express from 'express';
import { PORT } from './config/env.js';
import { connectToDB } from './config/database.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});