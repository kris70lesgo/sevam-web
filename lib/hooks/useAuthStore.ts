import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionPayload, UserType } from "@/types/auth";

// ─── State shape ──────────────────────────────────────────────────────────────

interface AuthState {
  /** Authenticated user's session payload (null = unauthenticated). */
  user: SessionPayload | null;
  /** Pending phone number while waiting for OTP verification. */
  pendingPhone: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  /** Called after successful OTP send — stores phone for the verify page. */
  setPendingPhone: (phone: string) => void;
  /** Called after successful OTP verify — stores full session. */
  setUser: (payload: SessionPayload) => void;
  /** Optimistic logout — clears local state (call the server action separately). */
  clearUser: () => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ── Initial state ──────────────────────────────────────────────
      user: null,
      pendingPhone: null,
      isLoading: false,
      error: null,

      // ── Actions ────────────────────────────────────────────────────
      setPendingPhone: (phone) =>
        set({ pendingPhone: phone, error: null }),

      setUser: (payload) =>
        set({ user: payload, pendingPhone: null, isLoading: false, error: null }),

      clearUser: () =>
        set({ user: null, pendingPhone: null, isLoading: false, error: null }),

      setLoading: (v) => set({ isLoading: v }),

      setError: (msg) => set({ error: msg, isLoading: false }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "sevam-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist the user payload — skip transient UI state
      partialize: (state) => ({
        user: state.user,
        pendingPhone: state.pendingPhone,
      }),
    }
  )
);

// ─── Derived selectors ────────────────────────────────────────────────────────

export const selectIsAuthenticated = (s: AuthStore) => s.user !== null;
export const selectUserType = (s: AuthStore): UserType | null =>
  s.user?.userType ?? null;
