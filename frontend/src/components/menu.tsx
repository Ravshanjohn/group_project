'use client';
import React, { JSX, useState, useEffect, use } from 'react'; 
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { auth_api } from '@/src/api/auth.api';
import { auth_store } from '@/src/stores/auth.store';
import { useUIStore } from '@/src/stores/ui.store';
import MoreOption from './MoreOption';
import { useTheme } from '@/src/lib/useTheme';

type SidebarMode = 'open' | 'closed';

interface CustomMenuItem {
    label: string;
    icon: string;
    badge?: number;
    url?: string;
}

interface MenuSection {
    title?: string;
    items: CustomMenuItem[];
}



export default function MenuBar() {
    const { sidebarMode, setSidebarMode, toggleSidebar, mobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUIStore();
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = auth_api;
    const user = auth_store((s) => s.user);

    const { currentTheme, cycleTheme } = useTheme();

    //More option state
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const toggleMoreOptions = () => {
        setShowMoreOptions(!showMoreOptions);
    };

    //Mobile more option state
    const [showMobileMoreOptions, setShowMobileMoreOptions] = useState(false);
    const toggleMobileMoreOptions = () => {
        setShowMobileMoreOptions(!showMobileMoreOptions);
    };

    // Load sidebar mode preference from localStorage
    useEffect(() => {
        const savedMode = localStorage.getItem('sidebarMode') as SidebarMode | null;
        if (savedMode === 'open' || savedMode === 'closed') {
            setSidebarMode(savedMode as SidebarMode);
        }
         
    }, []);

   

    // Save sidebar mode preference to localStorage
    useEffect(() => {
        localStorage.setItem('sidebarMode', sidebarMode);
    }, [sidebarMode]);

    // Determine if sidebar should be expanded
    const isExpanded = sidebarMode === 'open';

    const cycleSidebarMode = () => {
        toggleSidebar();
    };  

    const handleLogOut = async () => {
        try {
            await logout();
            router.push('/login');
            return;
        } catch (error) {
            return;
        }
    };

    const menuSections: MenuSection[] = [
        {
            items: [
                { label: 'Home', icon: 'pi pi-home', url: '/' },
                { label: 'Games', icon: 'pi pi-play-circle', url: '/games' },
                { label: 'Discord', icon: 'pi pi-discord', url: '/discord' },
            ]
        },
        {
            title: 'Pinned',
            items: [
                
            ]
        },
        {
            items: [
                { label: 'My paths', icon: 'pi pi-graduation-cap', url: '/my-paths' }
            ]
        }
    ];

    

    return (
        <>
        {/* Desktop Sidebar - Left  */}
        <div
            className="bg-surface hidden md:flex flex-col surface-border-right fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-outfont-sans"
            style={{ 
                width: isExpanded ? '220px' : '60px' }}
        >
                

            {/* Logo/Brand */}
            <div className="flex-none px-3 py-6 flex items-center">
                <div className="flex items-center">
                    {/* Placeholder Logo Icon */}
                    <i className="pi pi-bolt text-white text-xl shrink-0"></i> 
                    <span 
                        className={`ml-3 font-bold text-xl text-white tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                        }`}
                    >
                        Z<span className="text-zinc-500">TH</span>
                    </span>
                </div>
            </div>

            {/* Sidebar Mode Toggle Button */}
            <div className="flex-none px-3 pb-4 justify-center">
                <button
                    onClick={cycleSidebarMode}
                    className="w-full p-2.5 rounded-md hover:bg-zinc-800 transition-all duration-200 text-zinc-400 hover:text-white flex items-center gap-2"
                    title={`Current: ${sidebarMode === 'open' ? 'Always open' : 'Always closed'}`}
                    style={{
                        color: "rgb(var(--text_option_child))"
                    }}
                >
                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center">
                            <i className={`pi ${sidebarMode === 'open' ? 'pi-chevron-left' : 'pi-chevron-right'}`} 
                            style={{ fontSize: '0.6rem' }}></i>
                        </div>
                    </div>
                    <span 
                        className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                        }`}
                    >
                        {sidebarMode === 'open' ? 'Close' : 'Collapsed'}
                    </span>
                </button>
            </div>

            

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 space-y-6">
                
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        {section.title && (
                            <div 
                                className={`flex justify-center  font-semibold text-red-600 uppercase tracking-wider mb-2  whitespace-nowrap transition-opacity duration-300 ${
                                    isExpanded ? 'opacity-70 text-lg' : 'opacity-50 text-xs'
                                }`}
                            >
                                {section.title}
                            </div>
                        )}
                        <nav className="space-y-1">
                            {section.items.map((item, itemIndex) => {
                                const isActive = pathname === item.url;
                                
                                return (
                                    <div
                                        key={itemIndex}
                                        className={`group flex items-center rounded-lg cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors relative ${
                                            isActive ? 'bg-zinc-700 text-white' : ''
                                        } ${
                                            isExpanded ? 'px-3 py-2.5 flex-row' : 'px-2 py-3 flex-col'
                                        }`}
                                        onClick={() => item.url && (item.url.startsWith('http') ? window.open(item.url, '_blank') : router.push(item.url))}
                                        style={{
                                            color: "rgb(var(--text_option_header))"
                                        }}
                                    >
                                        <i className={`${item.icon} transition-colors } ${!isExpanded ? 'mb-1' : ''}`} 
                                        style={{ 
                                            color: "rgb(var(--text_header)))",
                                            fontSize: '1.2rem' 
                                            }}
                                        ></i>
                                        <span 
                                            className={`${ isExpanded ? 'ml-3 opacity-100' : 'text-xs opacity-100 text-center'}`}
                                        >
                                            {item.label}
                                        </span>
                                        {item.badge && isExpanded && (
                                            <Badge 
                                                value={item.badge.toString()} 
                                                severity="danger" 
                                                className="ml-auto"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                        {/* Add separator except for last item if needed, dependent on design. Image implies distinct sections layout. */}
                        {sectionIndex < menuSections.length - 1 && sectionIndex === 0 && (
                            <div className="my-4 border-b border-zinc-800 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="flex-none p-3 space-y-2">
                
                

                {/* Footer Icons Row */}
                <div className={`flex items-center px-1 py-2 ${isExpanded ? 'justify-between flex-row' : 'justify-center gap-2 flex-col'}`}>
                    {/* Profile */}
                    <button 
                        className={`p-2 rounded-full transition-colors  hover:text-white cursor-pointer`} 
                        title="Profile"
                        onClick={() => router.push('/user/profile')}
                        
                    >
                        <Avatar
                            image={user?.avatar || user?.first_name?.charAt(0).toUpperCase() || '?'}
                            shape="circle"
                            size="normal"
                            className="border-2 border-zinc-700"
                        />
                    </button>

                    {/* Help - Only when expanded */}
                    {isExpanded && (
                        <button 
                            className="p-2  rounded-full transition-colors  hover:text-white cursor-pointer" 
                            title="Shortcuts"
                            onClick={() => router.push("/shortcuts")}  
                            style={{
                                color: "rgb(var(--text_option_child))"
                            }} 
                        >
                            <i className="pi pi-question-circle" style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    )}

                     {/* Theme Toggle - Only when expanded */}
                     {isExpanded && (
                        <button 
                            className="p-2  rounded-full transition-colors  hover:text-white cursor-pointer" 
                            title={`Current theme: ${currentTheme}`}
                            onClick={cycleTheme}
                            style={{
                                color: "rgb(var(--text_option_child))"
                            }} 
                        >
                            <i className={`pi pi-moon`} style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    )}

                    {/* Notifications - Only when expanded */}
                    {isExpanded && (
                        <button
                            className="p-2  rounded-full transition-colors  hover:text-white relative cursor-pointer"
                            title="Notifications"
                            onClick={() => router.push('/notifications')}
                            style={{
                                color: "rgb(var(--text_option_child))"
                            }}
                        >
                            <i className="pi pi-bell" style={{ fontSize: '1.2rem' }}></i>
                            {/* Notification Dot */}
                            <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border border-black hidden"></div>
                        </button>
                    )}

                    {/* {isExpanded && (
                        <button 
                            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white" 
                            title="Sign out"
                            onClick={() => router.push("/auth/signout")}    
                        >
                            <i className="pi pi-sign-out" style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    )} */}

                    {/* More / Settings - Always visible on desktop */}
                    <button
                        className="p-2  rounded-full transition-colors  hover:text-white relative group cursor-pointer"
                        title="More"
                        onClick={toggleMoreOptions}
                        style={{
                            color: "rgb(var(--text_option_child))"
                        }} 
                    >
                        <i className="pi pi-ellipsis-h" style={{ fontSize: '1.2rem' }}></i>
                    </button>
                </div>
            </div>
        </div>

        {/* More Options Container - Outside sidebar to avoid overflow clipping */}
        {showMoreOptions && (
            <div className="fixed z-40" style={{ left: isExpanded ? '220px' : '60px', bottom: '64px' }}>
                <div className="ml-2">
                    <MoreOption isExpanded={isExpanded} />
                </div>
            </div>
        )}

        {/* Mobile Top Bar - Fixed at top */}
        <div className="bg-surface md:hidden fixed top-0 left-0 right-0 z-40  border-b border-zinc-700 mb-5">
            <div className="flex items-center justify-between px-5 py-3">
                {/* Hamburger Button - Left */}
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-white"
                    aria-label="Toggle menu"
                >
                    <i className="pi pi-bars" style={{ fontSize: '1.5rem' }}></i>
                </button>

                {/* Logo - Right */}
                <div className="flex items-center">
                    <i className="pi pi-bolt text-white text-xl"></i>
                    <span className="ml-2 font-bold text-xl text-white tracking-wide">
                        Z<span className="text-zinc-500">TH</span>
                    </span>
                </div>
            </div>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col">
                {/* Top Bar */}
                <div className="flex-none flex items-center justify-between p-4 border-b border-zinc-700">
                    {/* Logo - Top Left */}
                    <div className="flex items-center">
                        <i className="pi pi-bolt text-white text-2xl"></i>
                        <span className="ml-3 font-bold text-2xl text-white tracking-wide">
                            Z<span className="text-zinc-500">TH</span>
                        </span>
                    </div>

                    {/* Close Button - Top Right */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        aria-label="Close menu"
                    >
                        <i className="pi pi-times" style={{ fontSize: '1.5rem' }}></i>
                    </button>
                </div>

                {/* Scrollable Menu Items - Middle */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            {section.title && (
                                <div className="text-center font-semibold text-red-600 uppercase tracking-wider mb-4 text-lg">
                                    {section.title}
                                </div>
                            )}
                            <nav className="space-y-2">
                                {section.items.map((item, itemIndex) => {
                                    const isActive = pathname === item.url;

                                    return (
                                        <div
                                            key={itemIndex}
                                            className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors ${
                                                isActive ? 'bg-zinc-700 text-white' : 'text-zinc-300'
                                            }`}
                                            onClick={() => {
                                                if (item.url) {
                                                    if (item.url.startsWith('http')) {
                                                        window.open(item.url, '_blank');
                                                    } else {
                                                        router.push(item.url);
                                                        setMobileMenuOpen(false);
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <i className={`${item.icon}`} style={{ fontSize: '1.3rem' }}></i>
                                                <span className="text-lg">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <Badge
                                                    value={item.badge.toString()}
                                                    severity="danger"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                            {/* Divider Line - between sections */}
                            {sectionIndex < menuSections.length - 1 && (
                                <div className="my-6 border-b border-zinc-700" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="flex-none p-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between">
                        {/* Profile - Left Bottom */}
                        <button
                            className="p-2 rounded-lg "
                            onClick={() => {
                                router.push('/user/profile'); 
                                setMobileMenuOpen(false);
                            }}
                        >
                            <Avatar
                                image={user?.avatar || 'https://www.primefaces.org/cdn/primereact/images/avatar/amyelsner.png'}
                                shape="circle"
                                size="large"
                                className="border-2 border-zinc-700"
                            />
                        </button>

                        {/* Action Buttons - Right Bottom */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                className="p-3 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                title="Toggle theme"
                                onClick={cycleTheme}
                            >
                                <i className={`pi pi-moon`} style={{ fontSize: '1.2rem' }}></i>
                            </button>

                            {/* Notifications */}
                            <button
                                className="p-3  rounded-lg transition-colors text-zinc-400 hover:text-white relative"
                                title="Notifications"
                                onClick={() => {
                                    router.push('/notifications');
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <i className="pi pi-bell" style={{ fontSize: '1.3rem' }}></i>
                            </button>

                            {/* More Options */}
                            <button
                                className="p-3 rounded-lg transition-colors text-zinc-400 hover:text-white relative"
                                title="More"
                                onClick={toggleMobileMoreOptions}
                            >
                                <i className="pi pi-ellipsis-h" style={{ fontSize: '1.3rem' }}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile More Options Overlay */}
                {showMobileMoreOptions && (
                    <div className="flex flex-col bg-[#1a1a1a] w-80 max-h-[calc(100vh-15rem)]  fixed right-4 top-25 bottom-25 z-10 border border-zinc-700 rounded-lg shadow-xl">
                        

                        {/* More Options Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-8">
                                {[
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
                                ].map((category, index) => (
                                    <div key={index}>
                                        <h3 className="text-white font-semibold text-lg mb-4 pb-2 border-b border-zinc-500">{category.title}</h3>
                                        <ul className="space-y-3">
                                            {category.links.map((link, linkIndex) => (
                                                <li key={linkIndex}>
                                                    <a
                                                        href={link.url}
                                                        className="text-zinc-400 hover:text-white text-base transition-colors duration-200 block py-2"
                                                        onClick={() => {
                                                            setShowMobileMoreOptions(false);
                                                            setMobileMenuOpen(false);
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
                        </div>
                    </div>
                )}
            </div>
        )}


        </>
    )
}

        