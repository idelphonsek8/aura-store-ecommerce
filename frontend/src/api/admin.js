import client from "./client";

export async function fetchDashboard() {
  const { data } = await client.get("/admin/dashboard/");
  return data;
}

export async function fetchAdminOrders(params = {}) {
  const { data } = await client.get("/admin/orders/", { params });
  return data;
}

export async function fetchAdminOrder(id) {
  const { data } = await client.get(`/admin/orders/${id}/`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await client.patch(`/admin/orders/${id}/status/`, { status });
  return data;
}

export async function fetchAdminCustomers(params = {}) {
  const { data } = await client.get("/admin/customers/", { params });
  return data;
}

export async function fetchAdminCustomer(id) {
  const { data } = await client.get(`/admin/customers/${id}/`);
  return data;
}

export async function fetchAdminProducts(params = {}) {
  const { data } = await client.get("/admin/products/", { params });
  return data;
}

export async function fetchAdminProduct(id) {
  const { data } = await client.get(`/admin/products/${id}/`);
  return data;
}

export async function createAdminProduct(formData) {
  const { data } = await client.post("/admin/products/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateAdminProduct(id, formData) {
  const { data } = await client.patch(`/admin/products/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchAdminCategories() {
  const { data } = await client.get("/admin/categories/");
  return data;
}

export async function createAdminCategory(payload) {
  const { data } = await client.post("/admin/categories/", payload);
  return data;
}

export async function updateAdminCategory(id, payload) {
  const { data } = await client.patch(`/admin/categories/${id}/`, payload);
  return data;
}
