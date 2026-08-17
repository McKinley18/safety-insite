import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  // Keep the first render deterministic across SSR and the browser. The
  // browser's navigator.onLine value is read after hydration so it cannot
  // change the server-rendered icon tree during hydration.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
