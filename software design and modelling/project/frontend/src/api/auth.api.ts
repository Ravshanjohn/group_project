import instance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUIStore } from "../stores/ui.store";
import { getErrorMessage } from "../lib/errors";
import type { userStore, DeviceInfo } from "../types/user";

interface authApi {
  signup: (first_name: string, last_name: string | null, email: string, password: string, confirm_password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ user: userStore | null }>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getUser: () => Promise<userStore | null>;
  authCheck: () => Promise<boolean>;
  getDeviceInfo: () => Promise<DeviceInfo | null>;
}

export const auth_api: authApi = {

  signup: async (first_name, last_name, email, password, confirm_password): Promise<void> => {
    useUIStore.getState().setLoading('auth', true);

    if (password !== confirm_password) {
      toast.error("Passwords do not match");
      useUIStore.getState().setLoading('auth', false);
      return;
    }

    try {
      const res = await instance.post('/auth/signup', {
        firstName: first_name.trim(),
        lastName: last_name?.trim() || null,
        email: email.trim(),
        password,
      });

      if (res.data.error) {
        toast.error(res.data.error.message || "Signup failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success("Signup successful! Please log in.");

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  login: async (email, password): Promise<{ user: userStore | null }> => {
    useUIStore.getState().setLoading('auth', true);

    if (!email.trim() || !password) {
      toast.error("All fields are required");
      useUIStore.getState().setLoading('auth', false);
      return { user: null };
    }

    try {
      const res = await instance.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (res.data.error) {
        toast.error(res.data.error.message || "Login failed");
        useUIStore.getState().setLoading('auth', false);
        return { user: null };
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success("Login successful!");

      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      return { user: res.data.data?.user ?? null };
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
      return { user: null };
    }
  },

  logout: async (): Promise<void> => {
    useUIStore.getState().setLoading('auth', true);

    try {
      const res = await instance.post('/auth/logout');

      if (res.data.error) {
        toast.error(res.data.error.message || "Logout failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success("Logout successful!");
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  resendVerificationEmail: async (email): Promise<void> => {
    useUIStore.getState().setLoading('auth', true);

    if (!email.trim()) {
      toast.error("Email is required");
      useUIStore.getState().setLoading('auth', false);
      return;
    }

    try {
      const res = await instance.post('/auth/verify-email', {
        email: email.trim(),
      });

      if (res.data.error) {
        toast.error(res.data.error.message || "Request failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  verifyEmail: async (token): Promise<void> => {
    useUIStore.getState().setLoading('auth', true);

    try {
      const res = await instance.post(`/auth/email-verification/${token}`);

      if (res.data.error) {
        toast.error(res.data.error.message || "Email verification failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success("Email verified successfully! You can now log in.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  forgotPassword: async (email): Promise<void> => {
    useUIStore.getState().setLoading('auth', true);

    if (!email.trim()) {
      toast.error("Email is required");
      useUIStore.getState().setLoading('auth', false);
      return;
    }

    try {
      const res = await instance.post('/auth/forgot-password', {
        email: email.trim(),
      });

      if (res.data.error) {
        toast.error(res.data.error.message || "Request failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  resetPassword: async (token, newPassword): Promise<void> => {
    useUIStore.getState().setLoading('auth', true);

    if (!newPassword) {
      toast.error("New password is required");
      useUIStore.getState().setLoading('auth', false);
      return;
    }

    try {
      const res = await instance.post(`/auth/reset-password/${token}`, {
        newPassword,
      });

      if (res.data.error) {
        toast.error(res.data.error.message || "Password reset failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success("Password reset successful! You can now log in with your new password.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  getUser: async (): Promise<userStore | null> => {
    useUIStore.getState().setLoading('user', true);

    try {
      const res = await instance.get('/auth/get-user');

      if (res.data.error) {
        useUIStore.getState().setLoading('user', false);
        return null;
      }

      useUIStore.getState().setLoading('user', false);
      return res.data.data ?? null;
    } catch (error) {
      useUIStore.getState().setLoading('user', false);
      return null;
    }
  },

  authCheck: async (): Promise<boolean> => {
    useUIStore.getState().setLoading('auth', true);

    try {
      const res = await instance.get('/auth/profile');
      useUIStore.getState().setLoading('auth', false);
      return !res.data.error && Boolean(res.data.data);
    } catch {
      useUIStore.getState().setLoading('auth', false);
      return false;
    }
  },

  getDeviceInfo: async (): Promise<DeviceInfo | null> => {
    useUIStore.getState().setLoading('user', true);

    try {
      const res = await instance.get('/auth/device-info');

      if (res.data.error) {
        useUIStore.getState().setLoading('user', false);
        return null;
      }

      useUIStore.getState().setLoading('user', false);
      return res.data.data ?? null;
    } catch {
      useUIStore.getState().setLoading('user', false);
      return null;
    }
  },
};
