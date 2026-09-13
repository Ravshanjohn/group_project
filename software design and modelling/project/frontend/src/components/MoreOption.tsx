'use client';
import { useRouter } from 'next/navigation';

const MoreOption = ({ isExpanded = true }: { isExpanded?: boolean }) => {
  const router = useRouter();
  const categories = [
    {
      title: "Company",
      links: [
        { label: "Pricing", url: "/plans" },
        { label: "About us", url: "/about-us" },
        { label: "Contact", url: "/contact" },
        
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of use", url: "/terms-of-use" },
        { label: "Privacy policy", url: "/privacy-policy" },
        { label: "Cookies policy", url: "/cookies-policy" },
        { label: "Cookie settings", url: "/cookie-settings" }
      ]
    }
  ];

  return (
    <div className="w-96 bg-surface border border-zinc-700 rounded-lg shadow-xl p-6">
      {/* Main Content */}
      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
        {categories.map((category, index) => (
          <div key={index}>
            <h3 className="font-semibold text-lg mb-3"
              style={{
                color: "rgb(var(--text_header))"
              }}
            >{category.title}</h3>
            <ul className="space-y-2">
              {category.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a 
                    href={link.url}
                    className="hover:text-white text-sm transition-colors duration-200 block"
                    style={{
                      color: "rgb(var(--text_option_child))"
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Icons */}
      {!isExpanded && (
      <div className="flex items-center justify-start gap-3 pt-4 border-t border-zinc-700">
        <button 
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          title="Shortcuts"
          onClick={() => router.push('/shortcuts')}
        >
          <i className="pi pi-question-circle" style={{ fontSize: '1rem' }}></i>
        </button>
        <button 
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          title="Dark mode"
          onClick={() => alert('Dark mode toggled!')}
        >
          <i className="pi pi-moon" style={{ fontSize: '1rem' }}></i>
        </button>
        <button 
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          title="Notifications"
          onClick={() => router.push('/notifications')}
        >
          <i className="pi pi-bell" style={{ fontSize: '1rem' }}></i>
        </button>
      </div>
      )}
    </div>
  )
}

export default MoreOption