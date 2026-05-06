import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"
import { JWT_SECRET } from "../config/env.js";
import { ApiResponse, IUser } from "../types/index.js";


const generateToken = (id: string, email: string): string => {
    return jwt.sign({ id, email}, JWT_SECRET, { expiresIn:"7d"});
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try{
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists with this email",
            } as ApiResponse<null>);
            return;
        }

        const user = await User.create({ name, email, password});
        const token = generateToken(user._id.toString(), user.email);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }
        } as ApiResponse<object>);
    } catch(error) {
        res.status(500).json({
            success: false,
            message: "Server error during registration",
        } as ApiResponse<null>);
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try{
        const { email, password} = req.body;

        const user = await User.findOne({ email}).select("+password");
        if(!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            } as ApiResponse<null>);
            return;
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            } as ApiResponse<null>);
            return;
        }

        const token = generateToken(user._id.toString(), user.email);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                }
            }
        } as ApiResponse<object>);
    } catch(error) {
        res.status(500).json({
            success: false,
            message: "Server error during login"
        } as ApiResponse<null>);
    }
};