// API functions for communicating with the Habit Tracker backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to handle API responses and errors
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }
  return data;
}

// User registration - create new account
export async function signup(userData) {
  const res = await fetch(`${API_URL}/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

// User authentication - login and get JWT token
export async function login(credentials) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

// Fetch all habits for authenticated user with completion status
export async function getHabits(token) {
  const res = await fetch(`${API_URL}/habits`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// Create a new habit for authenticated user
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

// Mark a habit as completed for current period
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

// Delete a habit and all its completion logs
export async function deleteHabit(habitId, token) {
  const res = await fetch(`${API_URL}/habits/${habitId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}
