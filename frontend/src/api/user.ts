import api from "./axios.js";

export const syncUser = async () => {
  const res = await api.get("/users/me");
  return res.data;
};