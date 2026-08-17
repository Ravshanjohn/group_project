'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface CustomMenuItems {
  label: string;
  icon: string;
  badge?: number;
  url: string; // url is required for highlighting
};
interface MenuSection {
  title: string;
  items: CustomMenuItems[];
};

const menuSections: MenuSection[] = [
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        icon: "pi pi-user",
        url: "/user/profile"
      },
      {
        label: "Certificates",
        icon: "pi pi-file",
        url: "/user/certificates",
      },
      {
        label: "Progress",
        icon: "pi pi-chart-line",
        url: "/user/progress"
      }
    ]
  }
];

const UserSettingsMenu = () => {
  const pathname = usePathname()

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-1 gap-6">
      {menuSections.map((section, index) => (
        <div key={index} className="w-full bg-surface_secondary border rounded-tr-lg rounded-br-lg shadow-xl p-6"
          style={{
            borderColor: "var(--settings-menu-border-color)"
          }}
        >
          <h3 className="font-semibold text-sm mb-4"
            style={{
              color: "rgb(var(--text_option_header))"
            }}>
            {section.title}
          </h3>
          <ul className="space-y-3 ml-5">
            {section.items.map((item, itemIndex) => {
              const isActive = pathname === item.url
              

              return (
                <li key={itemIndex} >
                  <Link
                    href={item.url}
                    className="flex items-center py-3 px-5 gap-3 rounded-xl transition-all duration-200 text-sm "
                    style={{
                      backgroundColor: isActive ? 'var(--settings-menu-border-color)' : 'transparent',
                      color: isActive ? 'var(--settings-menu-text-color-active)' : 'var(--settings-menu-text-color-inactive)',
                      boxShadow: isActive ? 'var(--settings-menu-box-shadow-active)' : 'var(--settings-menu-box-shadow-inactive)',
                    }}

                  >
                    <i className={`${item.icon} }`} 
                      style={{ 
                        color: isActive ? 'var(--settings-menu-icon-color-active)' : 'var(--settings-menu-icon-color-inactive)',
                        fontSize: '1.2rem' 
                      }}></i>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: 'var(--settings-menu-badge-background)',
                          color: 'var(--settings-menu-badge-text-color)'
                        }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      
      
    </div>
  )
}

export default UserSettingsMenu