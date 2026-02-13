export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

const REGISTERED_KEY = 'mockUser';
const TOKEN_KEY = 'authToken';

export const registerUser = async (input: RegisterInput) => {
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(input));
  return { ok: true };
};

export const loginUser = async (input: LoginInput) => {
  const raw = localStorage.getItem(REGISTERED_KEY);
  if (!raw) {
    throw new Error('No registered user found. Please sign up first.');
  }

  const stored = JSON.parse(raw) as RegisterInput;
  if (stored.email !== input.email || stored.password !== input.password) {
    throw new Error('Invalid email or password.');
  }

  localStorage.setItem(TOKEN_KEY, 'mock-token');
  return { ok: true };
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isLoggedIn = () => Boolean(localStorage.getItem(TOKEN_KEY));
