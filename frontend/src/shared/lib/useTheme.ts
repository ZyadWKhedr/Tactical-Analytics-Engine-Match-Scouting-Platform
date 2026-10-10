import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeStore>((set) => {
  const savedTheme = (localStorage.getItem('tactical_theme') as Theme) || 'dark';

  // Apply class to html element
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }

  return {
    theme: savedTheme,
    toggleTheme: () => {
      set((state) => {
        const nextTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('tactical_theme', nextTheme);
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
        return { theme: nextTheme };
      });
    },
    setTheme: (theme: Theme) => {
      localStorage.setItem('tactical_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      set({ theme });
    },
  };
});
