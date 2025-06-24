import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

// Color theme type definition
export type ColorTheme = 'blue' | 'cyan' | 'green' | 'purple' | 'orange' | 'pink';

// Theme context interface
interface ThemeContextType {
  // Next-themes inherited
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  
  // Color theme extension
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  
  // Utility functions
  isDark: boolean;
  isSystemTheme: boolean;
}

// Color theme configurations
export const colorThemes: Record<ColorTheme, { value: string; preview: string; translationKey: string }> = {
  blue: {
    value: 'blue',
    preview: 'hsl(222.2, 47.4%, 11.2%)', // Default shadcn blue
    translationKey: 'settings.colors.blue',
  },
  cyan: {
    value: 'cyan',
    preview: 'hsl(189, 94%, 43%)', // Bright cyan
    translationKey: 'settings.colors.cyan',
  },
  green: {
    value: 'green',
    preview: 'hsl(142, 76%, 36%)', // Emerald green
    translationKey: 'settings.colors.green',
  },
  purple: {
    value: 'purple',
    preview: 'hsl(262, 83%, 58%)', // Violet purple
    translationKey: 'settings.colors.purple',
  },
  orange: {
    value: 'orange',
    preview: 'hsl(25, 95%, 53%)', // Orange
    translationKey: 'settings.colors.orange',
  },
  pink: {
    value: 'pink',
    preview: 'hsl(330, 81%, 60%)', // Pink
    translationKey: 'settings.colors.pink',
  },
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme storage keys
const COLOR_THEME_STORAGE_KEY = 'color-theme';

// Theme provider component
export function ExtendedThemeProvider({ children }: { children: React.ReactNode }) {
  const nextTheme = useNextTheme();
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('blue');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load color theme from localStorage
  useEffect(() => {
    try {
      const savedColorTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorTheme;
      if (savedColorTheme && colorThemes[savedColorTheme]) {
        setColorThemeState(savedColorTheme);
      }
    } catch (error) {
      console.warn('Failed to load color theme from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Apply color theme to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    
    // Remove existing color theme classes
    Object.keys(colorThemes).forEach(theme => {
      root.classList.remove(`theme-${theme}`);
    });
    
    // Add current color theme class
    root.classList.add(`theme-${colorTheme}`);
    
    // Save to localStorage
    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    } catch (error) {
      console.warn('Failed to save color theme to localStorage:', error);
    }
  }, [colorTheme, isLoaded]);

  // Color theme setter with validation
  const setColorTheme = (newColorTheme: ColorTheme) => {
    if (colorThemes[newColorTheme]) {
      setColorThemeState(newColorTheme);
    } else {
      console.warn(`Invalid color theme: ${newColorTheme}`);
    }
  };

  // Utility computations
  const isDark = nextTheme.resolvedTheme === 'dark';
  const isSystemTheme = nextTheme.theme === 'system';

  const contextValue: ThemeContextType = {
    // Next-themes integration
    theme: nextTheme.theme,
    setTheme: nextTheme.setTheme,
    resolvedTheme: nextTheme.resolvedTheme,
    
    // Color theme extension
    colorTheme,
    setColorTheme,
    
    // Utilities
    isDark,
    isSystemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useExtendedTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useExtendedTheme must be used within an ExtendedThemeProvider');
  }
  return context;
}

// Backwards compatibility hook
export function useColorTheme() {
  const { colorTheme, setColorTheme } = useExtendedTheme();
  return { colorTheme, setColorTheme };
} 