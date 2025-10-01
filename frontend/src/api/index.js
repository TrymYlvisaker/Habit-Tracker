const API_URL = "http://localhost:3000";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }
  return data;
}

export async function signup(userData) {
  const res = await fetch(`${API_URL}/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function login(credentials) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

export async function getHabits(token) {
  const res = await fetch(`${API_URL}/habits`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

export async function createHabit(habitData, token) {
  const res = await fetch(`${API_URL}/habits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habitData),
  });
  return handleResponse(res);
}

export async function completeHabit(habitId, token) {
  const res = await fetch(`${API_URL}/habits/${habitId}/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}
