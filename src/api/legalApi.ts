import { clearToken, getToken } from "@/api/session";
import { LEGAL_API_URL } from "@/config/apiUrls";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { router } from "expo-router";

export const legalApi = axios.create({
  baseURL: LEGAL_API_URL,
  timeout: 15000,
});

legalApi.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

legalApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
      useAuthStore.getState().logout();
      router.replace("/" as never);
    }
    return Promise.reject(error);
  },
);
