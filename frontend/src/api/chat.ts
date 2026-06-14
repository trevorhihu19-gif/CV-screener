import { api } from "./axios.ts";
import type { ApiResponse, ChatResponse, sendMessageParams } from "../types/index.ts";

export const sendMessage = async (
    message: string,
    job_id?: string | null
):Promise<ApiResponse<ChatResponse>> => {
    const body: sendMessageParams = { message };
    if (job_id) body.job_id = job_id

    const res = await api.post("/chat/", {
        message,
        job_id: job_id || null
    });
    return res.data;
};

export const clearMemory = async () => {
    const res = await api.delete("/chat/memory");
    return res.data;
};

export const getMemory = async () => {
    const res = await api.get("/chat/memory");
    return res.data
};
