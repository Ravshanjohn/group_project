import { toast } from "react-hot-toast";
import type { userStore } from "../types/user";
import instance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";
import { useUIStore } from "../stores/ui.store";

type UserProfileUpdates = {
  first_name: string;
  last_name: string;
};

export const user_api = {
  updateProfile: async (updates: UserProfileUpdates): Promise<userStore | null> => {
    useUIStore.getState().setLoading("user", true);

    try {
      const response = await instance.patch("/user/update", updates);

      if (response.data.error) {
        toast.error(response.data.error.message || "Profile update failed");
        return null;
      }

      toast.success("Profile updated");
      return response.data.data ?? null;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    } finally {
      useUIStore.getState().setLoading("user", false);
    }
  },

  topUpBalance: async (amount: number): Promise<number | null> => {
    useUIStore.getState().setLoading("user", true);

    try {
      const response = await instance.post("/user/top-up/balance", { amount });

      if (response.data.error) {
        toast.error(response.data.error.message || "Top-up failed");
        return null;
      }

      toast.success("Balance updated successfully");
      return response.data.data?.balance ?? null;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    } finally {
      useUIStore.getState().setLoading("user", false);
    }
  },

  buyMap: async (map_id: number, price: number, p_expires_at: string): Promise<boolean> => {
    useUIStore.getState().setLoading("user", true);

    try {
      const response = await instance.patch("/user/buy/map", { map_id, price, p_expires_at });

      if (response.data.error) {
        toast.error(response.data.error.message || "Purchase failed");
        return false;
      }

      toast.success("Map purchased successfully");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      useUIStore.getState().setLoading("user", false);
    }
  },

  getBalance: async (): Promise<number> => {
    try {
      const response = await instance.get("/user/balance");
      if (response.data.error) return 0;
      return response.data.data ?? 0;
    } catch {
      return 0;
    }
  },
};
