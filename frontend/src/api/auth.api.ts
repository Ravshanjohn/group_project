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
        first_name: first_name.trim(),
        last_name: last_name?.trim() || null,
        email: email.trim(),
        password,
        confirm_password,
      });

      if (res.data.success === false) {
        toast.error(res.data.message || "Signup failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success(res.data.message || "Signup successful! Please log in.");

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

      if (res.data.success === false) {
        toast.error(res.data.message || "Login failed");
        useUIStore.getState().setLoading('auth', false);
        return { user: null };
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success(res.data.message || "Login successful!");

      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }

      return { user: res.data.user };
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

      if (res.data.success === false) {
        toast.error(res.data.message || "Logout failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success(res.data.message || "Logout successful!");
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
      const res = await instance.post('/auth/resend-verification-email', {
        email: email.trim(),
      });

      if (res.data.success === false) {
        toast.error(res.data.message || "Request failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success(res.data.message || "Verification email sent! Please check your inbox.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  verifyEmail: async (token): Promise<void> => {
    useUIStore.getState().setLoading('auth', true);

    try {
      const res = await instance.post(`/auth/verify-email/${token}`);

      if (res.data.success === false) {
        toast.error(res.data.message || "Email verification failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success(res.data.message || "Email verified successfully! You can now log in.");
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

      if (res.data.success === false) {
        toast.error(res.data.message || "Request failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success(res.data.message || "Password reset email sent! Please check your inbox.");
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
        new_password: newPassword,
      });

      if (res.data.success === false) {
        toast.error(res.data.message || "Password reset failed");
        useUIStore.getState().setLoading('auth', false);
        return;
      }

      useUIStore.getState().setLoading('auth', false);
      toast.success(res.data.message || "Password reset successful! You can now log in with your new password.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      useUIStore.getState().setLoading('auth', false);
    }
  },

  getUser: async (): Promise<userStore | null> => {
    useUIStore.getState().setLoading('user', true);

    try {
      const res = await instance.get('/auth/get-user');

      if (res.data.success === false) {
        useUIStore.getState().setLoading('user', false);
        return null;
      }

      useUIStore.getState().setLoading('user', false);
      return res.data.user ?? null;
    } catch (error) {
      useUIStore.getState().setLoading('user', false);
      return null;
    }
  },

  authCheck: async (): Promise<boolean> => {
    useUIStore.getState().setLoading('auth', true);

    try {
      const res = await instance.get('/auth/auth-check');
      useUIStore.getState().setLoading('auth', false);
      return res.data.success === true;
    } catch {
      useUIStore.getState().setLoading('auth', false);
      return false;
    }
  },

  getDeviceInfo: async (): Promise<DeviceInfo | null> => {
    useUIStore.getState().setLoading('user', true);

    try {
      const res = await instance.get('/auth/device-info');

      if (res.data.success === false) {
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
