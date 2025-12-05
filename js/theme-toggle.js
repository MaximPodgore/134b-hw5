/**
 * Theme Toggle Functionality
 * Manages light/dark theme switching with localStorage persistence
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';
  const THEME_ATTR = 'data-theme';
  
  /**
   * Get the saved theme preference or default to 'dark'
   */
  function getThemePreference() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || 'dark';
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute(THEME_ATTR, 'light');
    } else {
      document.documentElement.removeAttribute(THEME_ATTR);
    }
  }

  /**
   * Save theme preference to localStorage
   */
  function saveThemePreference(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute(THEME_ATTR);
    const newTheme = current === 'light' ? 'dark' : 'light';
    
    applyTheme(newTheme);
    saveThemePreference(newTheme);
    
    // Update button aria-label
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.setAttribute('aria-label', 
        newTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      );
    }
  }

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    const theme = getThemePreference();
    applyTheme(theme);
  }

  /**
   * Setup theme toggle button
   */
  function setupToggleButton() {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    // Set initial aria-label
    const currentTheme = getThemePreference();
    button.setAttribute('aria-label', 
      currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
    );

    // Add click event
    button.addEventListener('click', toggleTheme);
    
    // Add keyboard support
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // Apply theme immediately (before DOM loads) to prevent flash
  initTheme();

  // Setup button after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupToggleButton);
  } else {
    setupToggleButton();
  }
})();
