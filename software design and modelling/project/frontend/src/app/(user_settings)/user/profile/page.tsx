'use client'
import { auth_store } from '@/src/stores/auth.store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/src/stores/ui.store';
import LoadingSpinner from '@/src/components/LoadingSpinner';

const profileFields = ["Avatar", "Name", "Last Name", "Email", "Balance"] as const;

const UserProfilePage = () => {
  const router = useRouter();
  const { getUser, updateUserProfile, logout } = auth_store();
  const isLoading = useUIStore((state) => state.loading.user);

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    avatar: "",
    balance: 0,
  });

  const [savedUserData, setSavedUserData] = useState(userData);
  const hasChanges = userData.first_name !== savedUserData.first_name
    || userData.last_name !== savedUserData.last_name;

  const getMappedValue = (label: string) => {
    switch (label) {
      case "Avatar":
        return userData.avatar ? userData.avatar : userData.first_name.charAt(0).toUpperCase() || '?';
      case "Name":
        return userData.first_name;
      case "Last Name":
        return userData.last_name;
      case "Email":
        return userData.email;
      case "Balance":
        return `${userData.balance} XP`;
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      useUIStore.getState().setLoading('user', true);
      const fetched = await getUser();

      if (fetched) {
        const profile = {
          first_name: fetched.first_name || '',
          last_name: fetched.last_name || '',
          email: fetched.email || '',
          avatar: fetched.avatar || '',
          balance: fetched.balance ?? 0,
        };
        setUserData(profile);
        setSavedUserData(profile);
      }

      useUIStore.getState().setLoading('user', false);
    };

    fetchUser();
  }, [getUser]);

  const handleSave = async () => {
    const updated = await updateUserProfile(userData.first_name, userData.last_name);
    if (updated) {
      setUserData((current) => ({
        ...current,
        first_name: updated.first_name || '',
        last_name: updated.last_name || '',
      }));
      setSavedUserData((current) => ({
        ...current,
        first_name: updated.first_name || '',
        last_name: updated.last_name || '',
      }));
    }
  };

  const handleCancel = () => setUserData(savedUserData);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl pb-20 cursor-default"
      style={{
        color: 'var(--user-settings-profile-header-text-color)'
      }}
    >
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Profile</h2>
          <div className="flex gap-3">
            {hasChanges ? (
              <>
                <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white disabled:opacity-50"
                >
                  Save
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {profileFields.map((item, idx) => {
            const displayValue = getMappedValue(item);

            return (
              <div key={idx}>
                <label
                  className="block font-semibold mb-2"
                  style={{
                    color: 'var(--user-settings-profile-userdata-header-text-color)'
                  }}
                >
                  {item}
                </label>

                {item === "Avatar" ? (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl font-medium shadow-lg mb-4 overflow-hidden"
                    style={{
                      background: 'var(--user-settings-profile-avatar-default-background)',
                      color: 'var(--user-settings-profile-avatar-text-color)'
                    }}
                  >
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      displayValue
                    )}
                  </div>
                ) : item === "Name" || item === "Last Name" ? (
                  <input
                    type="text"
                    value={displayValue}
                    onChange={(event) => setUserData((current) => ({
                      ...current,
                      [item === "Name" ? "first_name" : "last_name"]: event.target.value,
                    }))}
                    className="bg-zinc-800 w-full border rounded-lg p-3 transition-colors"
                  />
                ) : (
                  <div className="bg-zinc-800 w-full border rounded-lg p-3 transition-colors">
                    {displayValue || `Configure ${item}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
