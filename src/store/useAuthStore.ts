// stores/useAuthStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Permission {
  _id: string;
  name: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
interface AllowedStores {
  _id: string;
  storeId: string;
  storeName: string;
  storeEmail: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  allowedStores: AllowedStores[];
  profileImage: string | null;
  lastLogin: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
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
        token: state.token,
      }),
    }
  )
);

// Optional: Create hooks for common operations
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useHasPermission = () =>
  useAuthStore((state) => state.hasPermission);
export const useHasAnyPermission = () =>
  useAuthStore((state) => state.hasAnyPermission);
