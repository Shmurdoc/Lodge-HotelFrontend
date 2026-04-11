import { createContext, useContext, type ReactNode, type FC, useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User as AppUser } from '@/store/useAppStore';

/**
 * Auth Context - Manages user authentication and property scoping
 * 
 * This context ensures:
 * 1. User is authenticated via Supabase
 * 2. User's current property is tracked (for multi-tenant support)
 * 3. User's role/permissions are accessible to components
 * 4. All data operations are scoped to current property
 */

export interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
  propertyId: string | null;
  setPropertyId: (propertyId: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Parse user metadata from Supabase JWT
 * The JWT contains user_metadata with propertyId and role
 */
async function getUserMetadata(): Promise<{ propertyId?: string; role?: string } | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.user_metadata) {
      return data.session.user.user_metadata;
    }
  } catch (err) {
    console.error('Failed to parse user metadata:', err);
  }
  return null;
}

/**
 * AuthProvider component
 * Wraps the entire app to provide authentication and property scoping
 */
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth state on mount with timeout
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<typeof sessionPromise>;

        if (data.session?.user) {
          // Convert Supabase user to AppUser
          const appUser: AppUser = {
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email || 'Unknown',
            email: data.session.user.email || '',
            role: data.session.user.user_metadata?.role || 'staff',
            department: data.session.user.user_metadata?.department || 'General',
            phone: data.session.user.user_metadata?.phone || '',
            hireDate: data.session.user.created_at || new Date().toISOString(),
            status: 'active',
          };

          setUser(appUser);

          // Set initial property ID from metadata
          const metadata = await getUserMetadata();
          if (metadata?.propertyId) {
            setPropertyId(metadata.propertyId);
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize auth';
        console.warn('Auth initialization:', errorMsg);
        // Don't set error state - just continue without auth
        // setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes (non-blocking)
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const appUser: AppUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email || 'Unknown',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'staff',
            department: session.user.user_metadata?.department || 'General',
            phone: session.user.user_metadata?.phone || '',
            hireDate: session.user.created_at || new Date().toISOString(),
            status: 'active',
          };
          setUser(appUser);

          const metadata = await getUserMetadata();
          if (metadata?.propertyId) {
            setPropertyId(metadata.propertyId);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setPropertyId(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (err) {
      console.warn('Failed to subscribe to auth changes:', err);
    }
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setPropertyId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to logout';
      setError(errorMsg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, propertyId, setPropertyId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
