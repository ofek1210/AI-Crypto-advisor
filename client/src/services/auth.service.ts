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
const USER_KEY = 'authUser';
const NEW_USER_KEY = 'isNewUser';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const saveUser = (user: AuthResponse['user']) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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

  localStorage.setItem(NEW_USER_KEY, 'true');
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
  saveUser(data.user);
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(NEW_USER_KEY);
  localStorage.removeItem('onboardingComplete');
};

export const isLoggedIn = () => Boolean(localStorage.getItem(TOKEN_KEY));

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const getAuthUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse['user'];
  } catch {
    return null;
  }
};

export const isNewUser = () => localStorage.getItem(NEW_USER_KEY) === 'true';

export const clearNewUserFlag = () => localStorage.removeItem(NEW_USER_KEY);
