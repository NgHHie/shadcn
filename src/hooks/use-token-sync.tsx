// src/hooks/use-token-sync.tsx
import { useEffect, useState } from "react";
import { TokenManager } from "@/lib/token-manager";

export const useTokenSync = () => {
  const [syncStatus, setSyncStatus] = useState<{
    initialized: boolean;
    sources: {
      localStorage: { access: boolean; refresh: boolean };
      cookies: { access: boolean; refresh: boolean };
    };
    lastSync: Date | null;
  }>({
    initialized: false,
    sources: {
      localStorage: { access: false, refresh: false },
      cookies: { access: false, refresh: false },
    },
    lastSync: null,
  });

  const checkAndSync = () => {
    console.log("🔍 Checking token sync status...");

    // Force initialize from cookies
    TokenManager.initializeFromCookies();

    const sources = TokenManager.debugTokenSources();

    setSyncStatus({
      initialized: true,
      sources,
      lastSync: new Date(),
    });

    console.log("📊 Token sources:", sources);

    // Log current tokens for debugging
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    console.log("🔑 Current tokens:", {
      access: accessToken ? `${accessToken.substring(0, 20)}...` : "None",
      refresh: refreshToken ? `${refreshToken.substring(0, 20)}...` : "None",
    });
  };

  // Force sync on mount and when localStorage changes
  useEffect(() => {
    checkAndSync();

    // Listen for localStorage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        console.log("💾 LocalStorage changed, re-syncing...");
        checkAndSync();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Set up periodic check (every 10 seconds)
    const interval = setInterval(checkAndSync, 10000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Manual sync function
  const forceSync = () => {
    console.log("🔄 Force syncing tokens...");
    checkAndSync();
  };

  return {
    syncStatus,
    forceSync,
    hasTokens: TokenManager.hasValidTokens(),
  };
};
