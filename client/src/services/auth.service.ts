export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

const TOKEN_KEY = 'authToken';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const registerUser = async (input: RegisterInput) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = (await res.json()) as AuthResponse | { message?: string };

  if (!res.ok) {
    const message = 'message' in payload ? payload.message : 'Signup failed';
    throw new Error(message || 'Signup failed');
  }

  return payload as AuthResponse;
};

export const loginUser = async (input: LoginInput) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = (await res.json()) as AuthResponse | { message?: string };

  if (!res.ok) {
    const message = 'message' in payload ? payload.message : 'Login failed';
    throw new Error(message || 'Login failed');
  }

  const data = payload as AuthResponse;
  saveToken(data.token);
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isLoggedIn = () => Boolean(localStorage.getItem(TOKEN_KEY));

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
