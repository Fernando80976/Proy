import React, { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from './ThemeContext'; // Importamos el contexto desde el otro archivo

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    // Validación: Si el valor en localStorage no es 'blue' o 'purple', devolvemos 'blue'
    return (savedTheme === 'blue' || savedTheme === 'purple') ? savedTheme : 'blue';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'blue' ? 'purple' : 'blue'));
  };

  // 1. Efecto para aplicar clases al DOM y guardar en localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-blue', 'theme-purple');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // 2. Efecto para escuchar cambios externos (otras pestañas/devtools)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-theme') {
        const newValue = e.newValue as Theme;
        if (newValue === 'blue' || newValue === 'purple') {
          setTheme(newValue);
        } else {
          setTheme('blue'); // Valor por defecto ante corrupción de datos
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