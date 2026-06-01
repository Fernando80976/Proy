import React, { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from './ThemeContext'; 

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    
    return (savedTheme === 'blue' || savedTheme === 'purple') ? savedTheme : 'blue';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'blue' ? 'purple' : 'blue'));
  };

  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-blue', 'theme-purple');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-theme') {
        const newValue = e.newValue as Theme;
        if (newValue === 'blue' || newValue === 'purple') {
          setTheme(newValue);
        } else {
          setTheme('blue'); 
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};