'use client';
import { useUIStore } from '@/src/stores/ui.store';
import { useEffect, useState } from 'react';

const Container = ({ children }: { children: React.ReactNode }) => {
  const { sidebarMode } = useUIStore();
  const isExpanded = sidebarMode === 'open';
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const sidebarWidth = isExpanded ? 220 : 60;
  const paddingLeft = isDesktop ? sidebarWidth : 0;

  return (
    <div
        className="transition-all duration-300 ease-in-out pb-20 md:pb-0 pt-16 md:pt-0 w-full overflow-x-hidden px-4 md:px-0"
        style={{ paddingLeft: `${paddingLeft}px` }}
    >
        <div
        className="w-full"
        >
        {children}
        </div>
    </div>
  )
}

export default Container