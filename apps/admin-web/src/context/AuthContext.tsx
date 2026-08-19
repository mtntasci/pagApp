'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

export interface PortalUser {
  uid: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PAG_STAFF' | 'ORGANIZATION_USER' | 'CALL_CENTER_AGENT';
  organizationId?: string | null;
  status: 'ACTIVE' | 'DISABLED';
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  portalUser: PortalUser | null;
  isAdmin: boolean;
  isCallCenterAgent: boolean;
  isOrgUser: boolean;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  refreshPortalUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  portalUser: null,
  isAdmin: false,
  isCallCenterAgent: false,
  isOrgUser: false,
  loading: true,
  authError: null,
  signOut: async () => {},
  clearAuthError: () => {},
  refreshPortalUser: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchPortalUser = useCallback(async (currentUser: User) => {
    // 1. Super Admin Bootstrap for admin@pagapp.com & mtntasci@gmail.com
    const userEmail = (currentUser.email || '').toLowerCase();
    if (userEmail === 'admin@pagapp.com' || userEmail === 'mtntasci@gmail.com') {
      const bootstrapUser: PortalUser = {
        uid: currentUser.uid,
        email: currentUser.email || userEmail,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        mustChangePassword: userEmail === 'admin@pagapp.com'
      };
      setPortalUser(bootstrapUser);
      setIsAdmin(true);
      setAuthError(null);
      return bootstrapUser;
    }

    // 2. Fetch from Neon REST API /api/v1/admin/users
    try {
      const res = await fetch('/api/v1/admin/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.users)) {
          const found = json.data.users.find((u: any) => u.email?.toLowerCase() === userEmail || u.uid === currentUser.uid);
          if (found && found.status === 'ACTIVE') {
            const pUser: PortalUser = {
              uid: found.uid,
              email: found.email,
              role: found.role,
              organizationId: found.organizationId,
              status: found.status
            };
            setPortalUser(pUser);
            setIsAdmin(pUser.role === 'SUPER_ADMIN' || pUser.role === 'PAG_STAFF');
            setAuthError(null);
            return pUser;
          }
        }
      }
    } catch (apiErr) {
      console.warn('API fetch portal user error:', apiErr);
    }

    // 3. Verification failed -> reject session
    await firebaseSignOut(auth);
    setUser(null);
    setPortalUser(null);
    setIsAdmin(false);
    setAuthError('Bu hesap için PAG Portal erişimi bulunmuyor.');
    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          await fetchPortalUser(currentUser);
        } catch (err: any) {
          console.error('Portal Auth Verification Error:', err);
          await firebaseSignOut(auth);
          setUser(null);
          setPortalUser(null);
          setIsAdmin(false);
          setAuthError('Bu hesap için PAG Portal erişimi bulunmuyor.');
        }
      } else {
        setPortalUser(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchPortalUser]);

  const isCallCenterAgent = portalUser?.role === 'CALL_CENTER_AGENT';
  const isOrgUser = portalUser?.role === 'ORGANIZATION_USER';
  const isAuthorized = portalUser?.status === 'ACTIVE';

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = pathname === '/login';

      if (!user && !isPublicRoute) {
        router.push('/login');
      } else if (user && !isAuthorized && !isPublicRoute) {
        router.push('/login?error=unauthorized');
      } else if (user && isAuthorized && portalUser?.mustChangePassword === true && pathname !== '/change-password') {
        router.push('/change-password');
      } else if (user && isCallCenterAgent && pathname !== '/verification-calls' && pathname !== '/change-password' && !isPublicRoute) {
        router.push('/verification-calls');
      }
    }
  }, [user, isAuthorized, isCallCenterAgent, portalUser, loading, pathname, router]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setPortalUser(null);
    setIsAdmin(false);
    setAuthError(null);
    router.push('/login');
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const refreshPortalUser = async () => {
    if (user) {
      await fetchPortalUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, portalUser, isAdmin, isCallCenterAgent, isOrgUser, loading, authError, signOut, clearAuthError, refreshPortalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
