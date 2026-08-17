import { create } from 'zustand';
import { auth_api } from '../api/auth.api';
import type { userStore, DeviceInfo } from '../types/user';

export type { userStore };

interface Store {
  user: userStore | null;
  checkingAuth: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (first_name: string, last_name: string | null, email: string, password: string, confirm_password: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getUser: () => Promise<userStore | null>;
  authCheck: () => Promise<boolean>;
  getUserDeviceInfo: () => Promise<DeviceInfo | null>;
}

export const auth_store = create<Store>((set) => ({
  user: null,
  checkingAuth: true,

  login: async (email, password) => {
    const res = await auth_api.login(email, password);
    set({ user: res.user });
  },

  logout: async () => {
    await auth_api.logout();
    set({ user: null });
  },

  signup: async (first_name, last_name, email, password, confirm_password) => {
    await auth_api.signup(first_name, last_name, email, password, confirm_password);
  },

  resendVerificationEmail: async (email) => {
    await auth_api.resendVerificationEmail(email);
  },

  verifyEmail: async (token) => {
    await auth_api.verifyEmail(token);
  },

  forgotPassword: async (email) => {
    await auth_api.forgotPassword(email);
  },

  resetPassword: async (token, newPassword) => {
    await auth_api.resetPassword(token, newPassword);
  },

  getUser: async () => {
    const user = await auth_api.getUser();
    set({ user });
    return user;
  },

  authCheck: async () => {
    return auth_api.authCheck();
  },

  getUserDeviceInfo: async () => {
    return auth_api.getDeviceInfo();
  },
}));

