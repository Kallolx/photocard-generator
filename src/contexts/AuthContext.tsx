"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/lib/api";
import { setCookie, deleteAllAuthCookies } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import PlanUpgradeSuccessModal from "@/components/PlanUpgradeSuccessModal";

interface User {
  id: number;
  name: string;
  email: string;
  plan: "Free" | "Basic" | "Premium";
  role: "user" | "admin";
  plan_status: string;
  status: string;
}

interface Credits {
  daily_limit: number;
  cards_generated_today: number;
  last_reset_date: string;
  total_cards_generated: number;
  batch_processing_enabled: boolean;
  custom_cards_enabled: boolean;
  api_access_enabled: boolean;
}

interface Features {
  batchProcessing: boolean;
  customCards: boolean;
  apiAccess: boolean;
}

interface AuthContextType {
  user: User | null;
  credits: Credits | null;
  features: Features | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  canGenerateCard: () => boolean;
  remainingCards: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [features, setFeatures] = useState<Features | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from storage and verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          await refreshProfile();
        } catch (error) {
          console.error("Failed to load user profile:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        const {
          user,
          credits: userCredits,
          accessToken,
          refreshToken,
        } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setCookie("accessToken", accessToken, 7);
        setCookie("refreshToken", refreshToken, 30);

        // Update state
        setUser(user);
        setCredits(userCredits);

        // Set features based on credits
        setFeatures({
          batchProcessing: userCredits.batch_processing_enabled,
          customCards: userCredits.custom_cards_enabled,
          apiAccess: userCredits.api_access_enabled,
        });

        // Redirect based on role
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/url");
        }
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password);

      if (response.success) {
        const {
          user,
          credits: userCredits,
          accessToken,
          refreshToken,
        } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setCookie("accessToken", accessToken, 7);
        setCookie("refreshToken", refreshToken, 30);

        // Update state
        setUser(user);
        setCredits(userCredits);

        // Set features based on credits
        if (userCredits) {
          setFeatures({
            batchProcessing: userCredits.batch_processing_enabled,
            customCards: userCredits.custom_cards_enabled,
            apiAccess: userCredits.api_access_enabled,
          });
        }

        // Redirect to URL page (regular users only)
        router.push("/url");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    // Clear tokens from localStorage and cookies
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    deleteAllAuthCookies();

    // Clear state
    setUser(null);
    setCredits(null);
    setFeatures(null);

    // Redirect to home
    router.push("/");
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();

      if (response.success) {
        const {
          user: userData,
          credits: userCredits,
          features: userFeatures,
        } = response.data;
        setUser(userData);
        setCredits(userCredits);
        setFeatures(userFeatures);
      }
    } catch (error) {
      throw error;
    }
  };

  const refreshCredits = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data.credits) {
        setCredits(response.data.credits);
      }
    } catch (error) {
      console.error("Failed to refresh credits:", error);
    }
  };

  const canGenerateCard = (): boolean => {
    if (!credits) return false;

    // Premium users have unlimited
    if (user?.plan === "Premium") return true;

    // Check if under daily limit
    return credits.cards_generated_today < credits.daily_limit;
  };

  const remainingCards = (): number => {
    if (!credits) return 0;

    // Premium users have unlimited
    if (user?.plan === "Premium") return -1; // -1 indicates unlimited

    // Calculate remaining
    const remaining = credits.daily_limit - credits.cards_generated_today;
    return Math.max(0, remaining);
  };

  const value = {
    user,
    credits,
    features,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    refreshCredits,
    canGenerateCard,
    remainingCards,
  };

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newPlan, setNewPlan] = useState<"Basic" | "Premium">("Basic");

  // Check for plan upgrades
  useEffect(() => {
    if (user) {
      const lastKnownPlan = localStorage.getItem("last_known_plan");

      // If no stored plan, set it to current and don't show modal (initial load)
      if (!lastKnownPlan) {
        localStorage.setItem("last_known_plan", user.plan);
        return;
      }

      // If stored plan exists and is different from current
      if (lastKnownPlan !== user.plan) {
        // Determine if it's an upgrade
        const plans = ["Free", "Basic", "Premium"];
        const oldIndex = plans.indexOf(lastKnownPlan);
        const newIndex = plans.indexOf(user.plan);

        // If upgraded to a paid plan
        if (newIndex > oldIndex && newIndex > 0) {
          setNewPlan(user.plan as "Basic" | "Premium");
          setShowUpgradeModal(true);
        }

        // Update usage of known plan
        localStorage.setItem("last_known_plan", user.plan);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <PlanUpgradeSuccessModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        plan={newPlan}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
