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
    // Liquid Glass Design System
    glass: {
      // Backdrop blur levels
      blur: {
        sm: 'blur(8px)',
        md: 'blur(16px)',
        lg: 'blur(24px)',
        xl: 'blur(40px)',
      },
      // Glass surface colors with alpha
      surface: isDarkMode ? {
        primary: 'rgba(30, 30, 40, 0.6)',
        secondary: 'rgba(40, 40, 55, 0.5)',
        tertiary: 'rgba(50, 50, 70, 0.4)',
        elevated: 'rgba(35, 35, 50, 0.7)',
      } : {
        primary: 'rgba(255, 255, 255, 0.7)',
        secondary: 'rgba(255, 255, 255, 0.5)',
        tertiary: 'rgba(255, 255, 255, 0.3)',
        elevated: 'rgba(255, 255, 255, 0.85)',
      },
      // Border colors
      border: isDarkMode ? {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.15)',
        strong: 'rgba(255, 255, 255, 0.2)',
        glow: 'rgba(100, 150, 255, 0.3)',
      } : {
        light: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.08)',
        strong: 'rgba(0, 0, 0, 0.12)',
        glow: 'rgba(59, 130, 246, 0.2)',
      },
      // Gradient overlays
      gradient: isDarkMode ? {
        top: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        bottom: 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
        shimmer: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
        glow: 'radial-gradient(ellipse at center, rgba(100,150,255,0.15) 0%, transparent 70%)',
      } : {
        top: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
        bottom: 'linear-gradient(0deg, rgba(0,0,0,0.05) 0%, transparent 100%)',
        shimmer: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)',
        glow: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)',
      },
      // Shadows for depth
      shadow: isDarkMode ? {
        sm: '0 2px 8px rgba(0,0,0,0.3)',
        md: '0 4px 16px rgba(0,0,0,0.4)',
        lg: '0 8px 32px rgba(0,0,0,0.5)',
        glow: '0 0 30px rgba(100,150,255,0.15)',
        inner: 'inset 0 1px 1px rgba(255,255,255,0.1)',
      } : {
        sm: '0 2px 8px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(0,0,0,0.1)',
        lg: '0 8px 32px rgba(0,0,0,0.12)',
        glow: '0 0 30px rgba(59,130,246,0.15)',
        inner: 'inset 0 1px 1px rgba(255,255,255,0.8)',
      },
    },
    // Animation presets
    animation: {
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '800ms',
      },
    },
    // Legacy colors for compatibility
    colors: isDarkMode ? {
      background: '#0a0a0f',
      surface: 'rgba(30, 30, 40, 0.6)',
      surfaceHover: 'rgba(40, 40, 55, 0.7)',
      border: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      textMuted: 'rgba(255, 255, 255, 0.5)',
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
      background: '#f0f2f5',
      surface: 'rgba(255, 255, 255, 0.7)',
      surfaceHover: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(0, 0, 0, 0.08)',
      textPrimary: '#1a1a2e',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      textMuted: 'rgba(0, 0, 0, 0.4)',
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
