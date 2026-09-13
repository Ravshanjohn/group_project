export interface userStore {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  balance: number;
  avatar: string | null;
  is_verified: boolean;
  created_at: string;
  role?: string;
}

export interface DeviceInfo {
  os: string;
  browser: string;
  ip: string;
  last_active: string;
}
