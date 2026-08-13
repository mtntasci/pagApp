'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

export interface PortalUser {
  uid: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PAG_STAFF' | 'ORGANIZATION_USER';
  organizationId?: string | null;
  status: 'ACTIVE' | 'DISABLED';
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  portalUser: PortalUser | null;
  isAdmin: boolean;
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
    // 1. Try Cloud Function getPortalUser
    try {
      const getPortalUserFn = httpsCallable(functions, 'getPortalUser');
      const res: any = await getPortalUserFn({});
      const pData = res.data?.data?.portalUser;

      if (res.data?.success && pData && pData.status === 'ACTIVE') {
        setPortalUser(pData);
        setIsAdmin(pData.role === 'SUPER_ADMIN' || pData.role === 'PAG_STAFF');
        setAuthError(null);
        return pData;
      }
    } catch (callErr) {
      console.warn('Callable getPortalUser warning/fallback:', callErr);
    }

    // 2. Direct Firestore Client SDK Fallback Read
    try {
      const docRef = doc(db, 'portalUsers', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const pData = docSnap.data() as PortalUser;
        if (pData.status === 'ACTIVE') {
          setPortalUser(pData);
          setIsAdmin(pData.role === 'SUPER_ADMIN' || pData.role === 'PAG_STAFF');
          setAuthError(null);
          return pData;
        }
      }
    } catch (fsErr) {
      console.warn('Firestore client read fallback error:', fsErr);
    }

    // 3. Super Admin Bootstrap Fallback for admin@pagapp.com & mtntasci@gmail.com
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

    // 4. Verification failed -> reject session
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

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = pathname === '/login';

      if (!user && !isPublicRoute) {
        router.push('/login');
      } else if (user && !isAdmin && !isPublicRoute) {
        router.push('/login?error=unauthorized');
      } else if (user && isAdmin && portalUser?.mustChangePassword === true && pathname !== '/change-password') {
        router.push('/change-password');
      }
    }
  }, [user, isAdmin, portalUser, loading, pathname, router]);

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
    <AuthContext.Provider value={{ user, portalUser, isAdmin, loading, authError, signOut, clearAuthError, refreshPortalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
