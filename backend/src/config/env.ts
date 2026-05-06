import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local`});

const getEnv = (key: string, fallback?: string): string => {
    const value = process.env[key] ?? fallback;
    if(value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const PORT = getEnv("PORT", "5000");
export const MONGODB_URI = getEnv("MONGODB_URI");
export const JWT_SECRET = getEnv("JWT_SECRET", "superdupersecret");

