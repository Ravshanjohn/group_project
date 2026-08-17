'use client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const settingsSections = [
    {
      title: "Quick Actions",
      items: [
        { label: "Shortcuts", icon: "pi pi-question-circle", url: "/shortcuts" },
        { label: "Dark mode", icon: "pi pi-moon", action: () => alert('Dark mode toggled!') },
        { label: "Notifications", icon: "pi pi-bell", url: "/notifications" },
      ]
    },
    {
      title: "Company",
      items: [
        { label: "Pricing", icon: "pi pi-dollar", url: "/plans" },
        { label: "About us", icon: "pi pi-info-circle", url: "/about-us" },
        { label: "Contact", icon: "pi pi-envelope", url: "/contact" },
      ]
    },
    {
      title: "Legal",
      items: [
        { label: "Terms of use", icon: "pi pi-file-edit", url: "/terms-of-use" },
        { label: "Privacy policy", icon: "pi pi-shield", url: "/privacy-policy" },
        { label: "Cookies policy", icon: "pi pi-eye", url: "/cookies-policy" },
        { label: "Cookie settings", icon: "pi pi-cog", url: "/cookie-settings" }
      ]
    }
  ];

  const handleClick = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.url) {
      router.push(item.url);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-zinc-400">Manage your preferences and account settings</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleClick(item)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800">
                      <i className={`${item.icon} text-zinc-400`} style={{ fontSize: '1.2rem' }}></i>
                    </div>
                    <span className="text-zinc-300 flex-1">{item.label}</span>
                    <i className="pi pi-chevron-right text-zinc-600"></i>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
