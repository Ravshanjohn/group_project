import { create } from 'zustand';

type SidebarMode = 'open' | 'closed';
export type Theme = 'light' | 'dark';

interface UIStore {
    sidebarMode: SidebarMode;
    toggleSidebar: () => void;
    setSidebarMode: (mode: SidebarMode) => void;
    mobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    setMobileMenuOpen: (open: boolean) => void;

    /*Themes */
    currentTheme: Theme;
    setTheme: (theme: Theme) => void;
    

    
    loading: {
        auth: boolean; // authentication related loading state
        exercises: boolean;
        games: boolean; // games related loading state
        global: boolean;
        user_exercise: boolean; // user exercise related loading state
        user: boolean; // user related loading state
    };

    setLoading: (key: string, value: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
    sidebarMode: 'closed', // Default match with menu.tsx initialization
    toggleSidebar: () => set((state) => ({
        sidebarMode: state.sidebarMode === 'open' ? 'closed' : 'open'
    })),
    setSidebarMode: (mode) => set({ sidebarMode: mode }),
    mobileMenuOpen: false,
    toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

    loading: {
        auth: false,
        exercises: false,
        games: false,
        global: false,
        user_exercise: false,
        user: false,
    },

    setLoading: (key: string, value: boolean) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: value,
      },
    })),

    currentTheme: "dark",

    setTheme: (theme: Theme) => set({ currentTheme: theme }),


}));

