import client from "./client";

export async function createOrder(payload) {
  const { data } = await client.post("/customer/orders/", payload);
  return data;
}

export async function fetchMyOrders(params = {}) {
  const { data } = await client.get("/customer/orders/", { params });
  return data;
}

export async function fetchMyOrder(id) {
  const { data } = await client.get(`/customer/orders/${id}/`);
  return data;
}

export async function fetchProfile() {
  const { data } = await client.get("/customer/profile/");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await client.patch("/customer/profile/", payload);
  return data;
}
