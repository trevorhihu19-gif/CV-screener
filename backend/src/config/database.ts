import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

if(!MONGODB_URI) {
    throw new Error("please define the mongodb uri variable inside .env.local")
};

export async function connectToDB(): Promise<void> {
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("connected to database");
    } catch(error) {
        console.log("error connecting to database", error);
    }
}