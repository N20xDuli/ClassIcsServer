import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleDarkMode,
    colors: isDarkMode ? {
      // Dark mode colors
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#334155',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      success: '#10b981',
      successHover: '#059669',
      danger: '#ef4444',
      dangerHover: '#dc2626',
      warning: '#f59e0b',
      purple: '#9333ea',
      purpleHover: '#7c3aed',
      indigo: '#6366f1',
      indigoHover: '#4f46e5',
    } : {
      // Light mode colors
      background: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#f9fafb',
      border: '#e5e7eb',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textMuted: '#6b7280',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      success: '#10b981',
      successHover: '#059669',
      danger: '#ef4444',
      dangerHover: '#dc2626',
      warning: '#f59e0b',
      purple: '#9333ea',
      purpleHover: '#7c3aed',
      indigo: '#6366f1',
      indigoHover: '#4f46e5',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
