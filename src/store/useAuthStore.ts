// stores/useAuthStore.ts
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AllowedStores {
  _id: string;
  storeId: string;
  storeName: string;
  storeEmail: string;
}

export interface Permission {
  _id: string;
  name: string;
}

export interface UserRole {
  _id: string;
  name: string;
  permissions: Permission[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: string;
  profileImage: string | null;
  phone?: string;
  address?: string;
  allowedStores?: AllowedStores[];
  createdAt?: string;
  lastLogin?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null, token: string | null) => void;
  logout: () => void;
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      hasPermission: (permissionName) => {
        const { user } = get();
        if (!user || !user.roles) return false;

        return user.roles.some((role) =>
          role.permissions.some((perm) => perm.name === permissionName)
        );
      },

      hasAnyPermission: (permissionNames) => {
        const { user } = get();
        if (!user || !user.roles) return false;

        return permissionNames.some((permissionName) =>
          user.roles.some((role) =>
            role.permissions.some((perm) => perm.name === permissionName)
          )
        );
      },
    }),
    {
      name: 'auth-store', // LocalStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export const useAllowedStores = () => {
  const allowedStores = useAuthStore(
    (state) => state.user?.allowedStores || []
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated ? allowedStores : [];
};

// Optional: Create hooks for common operations
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useHasPermission = () =>
  useAuthStore((state) => state.hasPermission);
export const useHasAnyPermission = () =>
  useAuthStore((state) => state.hasAnyPermission);
