'use client'
import { auth_store } from '@/src/stores/auth.store';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/src/stores/ui.store';
import LoadingSpinner from '@/src/components/LoadingSpinner';



interface CustomTitles {
  title: string;
  section: string[];
}

interface DeviceInfo {
  title: string;
  sections: string[];
}


// This is a placeholder for future profile management features
const customTitles: CustomTitles[] = [
  {
    title: "Profile",
    //
    section: ["Avatar", "Name", "Last Name", "Email"]
  },
];
// This is a placeholder for future device management features
const Devices: DeviceInfo[] = [
  
  {
    title: "Connected Devices",
    sections: ["OS", "Browser", "IP Address", "Last Active"]
  }
]

const UserProfilePage = () => {
  const { user, getUser, getUserDeviceInfo } = auth_store();

  interface UserData {
    first_name: string;
    last_name: string | null;
    email: string;
    role: string;
    avatar: string;
    device_info: {
      os: string;
      browser: string;
      ip: string;
      last_active: string;
    };
    created_at: string;
    
  }

  const [userData, setUserData] = useState<UserData>({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    avatar: "",
    device_info: {
      os: "",
      browser: "",
      ip: "",
      last_active: "",
    },
    created_at: ""
  });

  // Helper function to map UI labels to data keys
  const getMappedValue = (label: string) => {
    switch (label) {
      case "Avatar":
        return userData.avatar ? userData.avatar : userData.first_name.charAt(0).toUpperCase() || '?';
      case "Name":
        return userData.first_name;
      case "Last Name":
        return userData.last_name ;
      case "Email":
        return userData.email;
      case "Role":
        return userData.role;
      default:
        return (userData as any)[label.toLowerCase()];
    }
  };

  const getDeviceValue = (label: string) => {
    switch (label) {
      case "OS":
        return userData.device_info.os;
      case "Browser":
        return userData.device_info.browser;
      case "IP Address":
        return userData.device_info.ip;
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      useUIStore.getState().setLoading('user', true);
      const fetched = await getUser();

      const deviceInfo = await getUserDeviceInfo();

      if (fetched) {
        setUserData({
          first_name: fetched.first_name || '',
          last_name: fetched.last_name || '',
          email: fetched.email || '',
          role: fetched.role || '',
          avatar: fetched.avatar || '',
          created_at: fetched.created_at || '',
          device_info: {
            os: deviceInfo.os || '',
            browser: deviceInfo.browser || '',
            ip: deviceInfo.ip || '',
            last_active: deviceInfo.last_active || ''
          },
        });
      }

      useUIStore.getState().setLoading('user', false);

      return; 
    };

    fetchUser();
  }, [getUser]);

  if (useUIStore((state) => state.loading.user)) return <LoadingSpinner />

  return (
    <div className="max-w-2xl pb-20 cursor-default"
      style={{
        color: 'var(--user-settings-profile-header-text-color)'
      }}
    >
      {customTitles.map((section, idx) => (
        <div key={idx} className="mb-16">
          <h2 className="text-3xl font-bold mb-8">{section.title}</h2>
          
          <div className="space-y-6">
            {section.section.map((item, itemIdx) => {
              const displayValue = getMappedValue(item);
              
              return (
                <div key={itemIdx}>
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
                  ) : (
                    //
                    <div className="bg-zinc-800 w-full border rounded-lg p-3 transition-colors"
                      // style={{
                      //   color: "var(--user-settings-profile-userdata-text-color)"
                      // }}
                    >
                      {displayValue || `Configure ${item}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Devices.map((device, idx) => (
        <div key={idx} className="mb-16">
          <h2 className="text-3xl font-bold mb-8">{device.title}</h2>
            <div className="space-y-0">
              {/* Header Row */}
              <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-transparent border-b"
                style={{
                  borderColor: "var(--user-settings-profile-userdata-border-color)"
                }}
              >
                {device.sections.map((section, sectionIdx) => (
                  <div key={sectionIdx} className="font-semibold text-sm uppercase tracking-wide"
                    style={{
                      color: "var(--user-settings-profile-userdata-header-text-color)"
                    }}
                  >{section}</div>
                ))}
                
              </div>
              
              {/* Table Row */}
              <div className="grid grid-cols-4 gap-4 px-4 py-4 bg-transparent border-b  transition-colors last:border-b-0 cursor-default"
                style={{
                  borderColor: "var(--user-settings-profile-userdata-border-color)"
                }}
              >
                <div style={{color: "var(--user-settings-profile-userdata-text-color)"}}>{userData.device_info.os}</div>
                <div style={{color: "var(--user-settings-profile-userdata-text-color)"}}>{userData.device_info.browser}</div>
                <div style={{color: "var(--user-settings-profile-userdata-text-color)"}}>{userData.device_info.ip}</div>
                <div style={{color: "var(--user-settings-profile-userdata-text-color)"}} className="flex justify-between items-center">
                  <span>{userData.device_info.last_active ? 'This device' : 'N/A'}</span>
                  <button className="user-settings-profile-trash-icon transition-colors ml-4 cursor-pointer">
                    <i className="pi pi-trash" style={{ fontSize: '1rem' }}></i>
                  </button>
                </div>
              </div>
            </div>
        </div>
      ))}

      
    </div>
  )
}

export default UserProfilePage