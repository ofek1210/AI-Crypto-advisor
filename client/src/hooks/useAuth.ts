import { useEffect, useState } from 'react';
import { getAuthUser, isLoggedIn, logoutUser } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState(getAuthUser());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  useEffect(() => {
    const handler = () => {
      setUser(getAuthUser());
      setLoggedIn(isLoggedIn());
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    setLoggedIn(false);
  };

  return { user, loggedIn, logout };
};
