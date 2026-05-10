import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { AuthRequest } from "../types/index.js";

export const protect = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "No token provided, Authorization denied",
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
        };

        req.User = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    } catch(error) {
        console.error(error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}
