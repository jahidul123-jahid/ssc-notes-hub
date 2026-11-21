import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Bulletproof Scroll Restoration Manager
 * Ensures that whenever a route changes anywhere in the website,
 * the window scrolls smoothly and safely to top (0, 0) across all devices and browsers
 * without throwing errors or blocking React Router navigation.
 */
export const ScrollRestorationManager: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    } catch {
      try {
        window.scrollTo(0, 0);
      } catch {
        // Safe fallback if window is not defined
      }
    }
  }, [pathname]);

  return null;
};
