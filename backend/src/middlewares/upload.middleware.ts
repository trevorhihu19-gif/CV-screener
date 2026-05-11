import multer, { FileFilterCallback} from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const uploadsDir = "uploads";
if(!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, _file, cb) => {
        const uniqueSuffix = `${Date.now()}- ${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(_file.originalname);
        cb(null, `cv-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    if(file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});