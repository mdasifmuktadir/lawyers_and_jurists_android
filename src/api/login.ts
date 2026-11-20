import { LEGAL_API_URL } from "@/config/apiUrls";
import axios from "axios";
import { saveToken } from "./session";

export async function login(email: string, password: string) {
  const { data } = await axios.post(`${LEGAL_API_URL}/login`, {
    email: email.trim(),
    password,
  });
  await saveToken(data.token);
  return data as {
    token: string;
    user: { id: number; name: string; email: string };
  };
}
