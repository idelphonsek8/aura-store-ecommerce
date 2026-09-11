import client, { setTokens } from "./client";

export async function register(payload) {
  const { data } = await client.post("/auth/register/", payload);
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export async function login(email, password) {
  const { data } = await client.post("/auth/login/", { email, password });
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export async function adminLogin(email, password) {
  const { data } = await client.post("/auth/admin-login/", { email, password });
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export async function logout() {
  const tokens = JSON.parse(localStorage.getItem("aura_tokens") || "null");
  try {
    if (tokens?.refresh) await client.post("/auth/logout/", { refresh: tokens.refresh });
  } finally {
    setTokens(null);
  }
}

export async function fetchMe() {
  const { data } = await client.get("/auth/me/");
  return data;
}

export async function changePassword(payload) {
  const { data } = await client.post("/auth/change-password/", payload);
  return data;
}
