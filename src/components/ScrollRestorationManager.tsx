import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const SCROLL_STORAGE_KEY = 'ssc_hub_scroll_positions_v1';

function getStoredPositions(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredPosition(key: string, y: number) {
  try {
    const positions = getStoredPositions();
    positions[key] = y;
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export const ScrollRestorationManager: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType(); // 'PUSH' | 'POP' | 'REPLACE'
  const prevKeyRef = useRef<string>(location.key);
  const prevPathRef = useRef<string>(location.pathname);
  const isRestoringRef = useRef<boolean>(false);

  // Continuously record scroll position for current location before user leaves
  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = () => {
      if (isRestoringRef.current) return;
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        const currentY = window.scrollY || window.pageYOffset || 0;
        saveStoredPosition(location.key, currentY);
        saveStoredPosition(location.pathname, currentY);
      }, 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.key, location.pathname]);

  // Handle navigation events
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    const prevPath = prevPathRef.current;
    prevKeyRef.current = location.key;
    prevPathRef.current = location.pathname;

    // If only query params or hash changed on the same page, do not reset scroll
    if (prevPath === location.pathname && navigationType === 'REPLACE') {
      return;
    }

    if (navigationType === 'POP') {
      // User clicked Back or Forward button
      const positions = getStoredPositions();
      const targetY = positions[location.key] ?? positions[location.pathname] ?? 0;

      isRestoringRef.current = true;

      // Restore scroll position with multi-attempt retry to account for async data fetching
      let attempts = 0;
      const maxAttempts = 10;

      const attemptRestore = () => {
        window.scrollTo({
          top: targetY,
          left: 0,
          behavior: 'instant'
        });

        const currentY = window.scrollY || window.pageYOffset || 0;
        attempts++;

        // If not yet reached and document is still growing, retry in next frame/tick
        if (Math.abs(currentY - targetY) > 10 && attempts < maxAttempts) {
          window.setTimeout(attemptRestore, 50 * attempts);
        } else {
          isRestoringRef.current = false;
        }
      };

      // Trigger immediate first attempt, then follow-ups if needed
      attemptRestore();
    } else {
      // User clicked a new link ('PUSH') or refreshed ('REPLACE' with new page)
      isRestoringRef.current = false;

      // Immediately scroll to the very top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });

      // Save top for the new page
      saveStoredPosition(location.key, 0);
      saveStoredPosition(location.pathname, 0);
    }
  }, [location.key, location.pathname, navigationType]);

  return null;
};
