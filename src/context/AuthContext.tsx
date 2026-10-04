import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PROFILES, loadFromStorage, saveToStorage, normalizeProfilesList } from '../lib/mockStore';

interface AuthContextType {
  currentUser: { id: string; email: string } | null;
  profile: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isMember: boolean;
  isLoading: boolean;
  isLiveSupabase: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: Partial<Profile> & { email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<Profile>) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message: string; resetLink: string }>;
  changePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  switchProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  availableProfiles: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    normalizeProfilesList(loadFromStorage<Profile[]>('profiles', INITIAL_PROFILES))
  );

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return loadFromStorage<string>('active_profile_id', '');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);

  // Sync profiles state to storage
  useEffect(() => {
    saveToStorage('profiles', profiles);
  }, [profiles]);

  useEffect(() => {
    saveToStorage('active_profile_id', activeProfileId);
  }, [activeProfileId]);

  // Check Supabase session on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsLiveSupabase(true);
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setProfiles(prev => {
                const exists = prev.find(p => p.id === profileData.id);
                return exists
                  ? prev.map(p => (p.id === profileData.id ? profileData : p))
                  : [profileData, ...prev];
              });
              setActiveProfileId(profileData.id);
            }
          }
        } catch (err) {
          console.warn('Supabase session check failed, using local profile session', err);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const role: UserRole = activeProfile?.role || 'member';

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          setIsLiveSupabase(true);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileData) {
            setProfiles(prev => {
              const exists = prev.find(p => p.id === profileData.id);
              return exists
                ? prev.map(p => (p.id === profileData.id ? profileData : p))
                : [profileData, ...prev];
            });
            setActiveProfileId(profileData.id);
          }
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Authentication error' };
      }
    }

    // Local-only login by email matching is retained for portal records created
    // before Supabase credentials are configured.
    const normalizedEmail = email.trim().toLowerCase();
    const matched = profiles.find(
      p => p.cadet365_email.toLowerCase() === normalizedEmail
    );

    if (matched) {
      setActiveProfileId(matched.id);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: `Cadet365 email '${email}' not found.`,
    };
  };

  const signUp = async (
    data: Partial<Profile> & { email: string; password?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && data.password) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.first_name || 'Cadet',
              last_name: data.last_name || 'Musician',
              rank: data.rank || 'Cdt',
              instrument: data.instrument || 'Clarinet 1',
              role: data.role || 'member',
              phone: data.phone || null,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (authData.user) {
          setIsLiveSupabase(true);
          // Wait briefly for trigger
          const newProfile: Profile = {
            id: authData.user.id,
            first_name: data.first_name || 'Cadet',
            last_name: data.last_name || 'Musician',
            rank: data.rank || 'Cdt',
            cadet365_email: data.email,
            instrument: data.instrument || 'Clarinet 1',
            role: data.role || 'member',
            phone: data.phone || null,
            created_at: new Date().toISOString(),
          };
          setProfiles(prev => [newProfile, ...prev]);
          setActiveProfileId(newProfile.id);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Registration error' };
      }
    }

    // Mock account creation
    const newId = `u-${Date.now().toString(36)}`;
    const newProfile: Profile = {
      id: newId,
      first_name: data.first_name || 'Cadet',
      last_name: data.last_name || 'Member',
      rank: data.rank || 'Cdt',
      cadet365_email: data.email || `cadet.${Date.now()}@cadets365.ca`,
      instrument: data.instrument || 'Clarinet 1',
      role: data.role || 'member',
      phone: data.phone || null,
      created_at: new Date().toISOString(),
    };

    setProfiles(prev => [newProfile, ...prev]);
    setActiveProfileId(newId);
    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Sign out error', e);
      }
    }
    // Set to first member profile for smooth experience
    const firstMember = profiles.find(p => p.role === 'member') || profiles[0];
    if (firstMember) {
      setActiveProfileId(firstMember.id);
    }
  };

  const updateCurrentProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!activeProfile) return false;

    // Security check: members cannot elevate their own role
    if (activeProfile.role === 'member' && updates.role && updates.role !== 'member') {
      delete updates.role;
    }

    const updatedProfile = { ...activeProfile, ...updates };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      try {
        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', activeProfile.id);
      } catch (err) {
        console.error('Error updating live Supabase profile:', err);
      }
    }

    setProfiles(prev => prev.map(p => (p.id === activeProfile.id ? updatedProfile : p)));
    return true;
  };

  const sendPasswordResetEmail = async (
    email: string
  ): Promise<{ success: boolean; message: string; resetLink: string }> => {
    const supabase = getSupabaseClient();

    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase is not configured.',
        resetLink: '',
      };
    }

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/forgot-password` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        redirectTo ? { redirectTo } : undefined
      );

      if (error) {
        return {
          success: false,
          message: error.message,
          resetLink: '',
        };
      }

      return {
        success: true,
        message: `Password reset instructions were sent to ${email.trim().toLowerCase()}.`,
        resetLink: '',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Unable to send password reset email.',
        resetLink: '',
      };
    }
  };

  const changePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) return { success: false, error: 'Supabase is not configured.' };
    if (password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const switchProfile = (profileId: string) => {
    const target = profiles.find(p => p.id === profileId);
    if (!target) return;
    setActiveProfileId(profileId);
  };

  const deleteProfile = (profileId: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== profileId);
      saveToStorage('profiles', next);
      return next;
    });
    if (activeProfileId === profileId) {
      const remaining = profiles.filter(p => p.id !== profileId);
      if (remaining.length > 0) {
        setActiveProfileId(remaining[0].id);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: activeProfile ? { id: activeProfile.id, email: activeProfile.cadet365_email } : null,
        profile: activeProfile || null,
        role,
        isAdmin: role === 'admin',
        isMember: role === 'member',
        isLoading,
        isLiveSupabase,
        signIn,
        signUp,
        signOut,
        updateCurrentProfile,
        sendPasswordResetEmail,
        changePassword,
        switchProfile,
        deleteProfile,
        availableProfiles: profiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
