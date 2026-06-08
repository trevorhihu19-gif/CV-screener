import { aj } from "../config/arcjet.js";
import { Request, Response, NextFunction } from "express";

 export const arcjetProtect =async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try{
        const decision = await aj.protect(req, { requested: 1});

        if(decision.isDenied()) {
            if(decision.reason.isRateLimit()) {
                res.status(429).json({
                    success: false,
                    message: "Too many requests"
                });
                return;
            }
            if(decision.reason.isBot()) {
                res.status(403).json({
                    success: false,
                    message: "Bot detected - Automated requests are not allowed"
                });
                return;
            }
            if(decision.reason.isShield()) {
                res.status(403).json({
                    success: false,
                    message: "Request blocked for security reasons"
                });
                return;
            }

            res.status(403).json({
                success: false,
                message: "Request denied"
            });
            return;
        }

        next();
    } catch(error) {
        console.error("Arcjet error", error);
        next();
    }
};



