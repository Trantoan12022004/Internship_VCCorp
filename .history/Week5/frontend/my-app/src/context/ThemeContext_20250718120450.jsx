import React, { createContext, useContext, useReducer, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Theme types
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Initial state
const initialState = {
  theme: THEMES.SYSTEM,
  actualTheme: THEMES.LIGHT, // The actual theme being used (light or dark)
  fontSize: 'medium',
  language: 'en',
  sidebarCollapsed: false,
  animations: true,
  notifications: true
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_ACTUAL_THEME: 'SET_ACTUAL_THEME',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  SET_LANGUAGE: 'SET_LANGUAGE',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_ANIMATIONS: 'SET_ANIMATIONS',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  RESET_PREFERENCES: 'RESET_PREFERENCES'
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
    case THEME_ACTIONS.SET_ACTUAL_THEME:
      return {
        ...state,
        actualTheme: action.payload
      };
    case THEME_ACTIONS.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload
      };
    case THEME_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload
      };
    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
    case THEME_ACTIONS.SET_ANIMATIONS:
      return {
        ...state,
        animations: action.payload
      };
    case THEME_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };
    case THEME_ACTIONS.RESET_PREFERENCES:
      return initialState;
    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const [preferences, setPreferences] = useLocalStorage('theme-preferences', initialState);
  const [state, dispatch] = useReducer(themeReducer, preferences);

  // Update localStorage when state changes
  useEffect(() => {
    setPreferences(state);
  }, [state, setPreferences]);

  // Handle system theme changes
  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      if (state.theme === THEMES.SYSTEM) {
        dispatch({
          type: THEME_ACTIONS.SET_ACTUAL_THEME,
          payload: e.matches ? THEMES.DARK : THEMES.LIGHT
        });
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on system preference
    if (state.theme === THEMES.SYSTEM) {
      dispatch({
        type: THEME_ACTIONS.SET_ACTUAL_THEME,
        payload: mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT
      });
    } else {
      dispatch({
        type: THEME_ACTIONS.SET_ACTUAL_THEME,
        payload: state.theme
      });
    }

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [state.theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(state.actualTheme);
    
    // Set CSS custom properties
    root.style.setProperty('--font-size-base', 
      state.fontSize === 'small' ? '14px' : 
      state.fontSize === 'large' ? '18px' : '16px'
    );
    
    // Set animations
    if (!state.animations) {
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--transition-duration');
    }
  }, [state.actualTheme, state.fontSize, state.animations]);

  // Theme functions
  const setTheme = (theme) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
  };

  const setFontSize = (size) => {
    dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: size });
  };

  const setLanguage = (language) => {
    dispatch({ type: THEME_ACTIONS.SET_LANGUAGE, payload: language });
  };

  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setAnimations = (enabled) => {
    dispatch({ type: THEME_ACTIONS.SET_ANIMATIONS, payload: enabled });
  };

  const setNotifications = (enabled) => {
    dispatch({ type: THEME_ACTIONS.SET_NOTIFICATIONS, payload: enabled });
  };

  const resetPreferences = () => {
    dispatch({ type: THEME_ACTIONS.RESET_PREFERENCES });
  };

  const toggleTheme = () => {
    if (state.theme === THEMES.LIGHT) {
      setTheme(THEMES.DARK);
    } else if (state.theme === THEMES.DARK) {
      setTheme(THEMES.SYSTEM);
    } else {
      setTheme(THEMES.LIGHT);
    }
  };

  const value = {
    ...state,
    setTheme,
    setFontSize,
    setLanguage,
    toggleSidebar,
    setAnimations,
    setNotifications,
    resetPreferences,
    toggleTheme,
    THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
