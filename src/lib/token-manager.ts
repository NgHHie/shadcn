// src/lib/token-manager.ts

// Cookie utilities
class CookieUtils {
  static getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  static setCookie(
    name: string,
    value: string,
    options: {
      domain?: string;
      path?: string;
      maxAge?: number;
      secure?: boolean;
      sameSite?: "Strict" | "Lax" | "None";
    } = {}
  ): void {
    if (typeof document === "undefined") return;

    const {
      domain = ".learnsql.store", // Shared across subdomains
      path = "/",
      maxAge = 7 * 24 * 60 * 60, // 7 days
      secure = true,
      sameSite = "Lax",
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (domain) cookieString += `; Domain=${domain}`;
    if (path) cookieString += `; Path=${path}`;
    if (maxAge) cookieString += `; Max-Age=${maxAge}`;
    if (secure) cookieString += `; Secure`;
    if (sameSite) cookieString += `; SameSite=${sameSite}`;

    document.cookie = cookieString;
  }

  static removeCookie(name: string, domain = ".learnsql.store"): void {
    if (typeof document === "undefined") return;

    document.cookie = `${name}=; Domain=${domain}; Path=/; Max-Age=0`;
  }
}

// Token management with cookie integration
export class TokenManager {
  private static isRefreshing = false;
  private static refreshPromise: Promise<string> | null = null;
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly COOKIE_ACCESS_TOKEN = "access_token";
  private static readonly COOKIE_REFRESH_TOKEN = "refresh_token";

  // Simple validation - just check if tokens exist and not empty
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return !!(
      accessToken &&
      refreshToken &&
      accessToken.trim() !== "" &&
      refreshToken.trim() !== ""
    );
  }

  static getAccessToken(): string | null {
    // Try localStorage first (faster)
    let token = localStorage.getItem(this.ACCESS_TOKEN_KEY);

    // If not in localStorage, try cookie
    if (!token) {
      token = CookieUtils.getCookie(this.COOKIE_ACCESS_TOKEN);
      if (token) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
        console.log("🔄 Retrieved access token from cookie");
      }
    }

    // Clean up token format
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    return token?.trim() || null;
  }

  static getRefreshToken(): string | null {
    // Try localStorage first (faster)
    let token = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    // If not in localStorage, try cookie
    if (!token) {
      token = CookieUtils.getCookie(this.COOKIE_REFRESH_TOKEN);
      if (token) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
        console.log("🔄 Retrieved refresh token from cookie");
      }
    }

    // Clean up token format
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    return token?.trim() || null;
  }

  static setTokens(accessToken: string, refreshToken?: string): void {
    // Save to localStorage
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    // Save to cookies (shared across subdomains)
    this.setCookieToken(this.COOKIE_ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      this.setCookieToken(this.COOKIE_REFRESH_TOKEN, refreshToken);
    }

    console.log("💾 Tokens saved to both localStorage and cookies");
  }

  static clearTokens(): void {
    console.log("🗑️ Clearing all authentication tokens...");

    // Clear localStorage
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);

    // Clear cookies
    CookieUtils.removeCookie(this.COOKIE_ACCESS_TOKEN);
    CookieUtils.removeCookie(this.COOKIE_REFRESH_TOKEN);

    // Clear any other auth-related data
    localStorage.removeItem("user_info");
    localStorage.removeItem("user_profile");

    console.log("✅ All tokens and auth data cleared");
  }

  static async refreshAccessToken(): Promise<string> {
    // Prevent multiple refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private static async performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      console.log("🔄 Attempting to refresh access token...");

      const response = await fetch(
        "https://api.learnsql.store/api/app/user/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      if (!response.ok) {
        this.clearTokens();
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 1 && data.accessToken) {
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken || refreshToken;

        this.setTokens(newAccessToken, newRefreshToken);
        console.log("✅ Access token refreshed successfully");

        return newAccessToken;
      } else {
        this.clearTokens();
        throw new Error("Invalid refresh response format");
      }
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      this.clearTokens();
      throw error;
    }
  }

  // Initialize tokens from cookies on app start
  static initializeFromCookies(): void {
    console.log("🚀 Starting token initialization from cookies...");

    try {
      const cookieAccessToken = CookieUtils.getCookie(this.COOKIE_ACCESS_TOKEN);
      const cookieRefreshToken = CookieUtils.getCookie(
        this.COOKIE_REFRESH_TOKEN
      );

      const localAccessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const localRefreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

      // Sync from cookies to localStorage if missing
      if (cookieAccessToken && !localAccessToken) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, cookieAccessToken);
        console.log("✅ Synced access token: Cookie → localStorage");
      }

      if (cookieRefreshToken && !localRefreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, cookieRefreshToken);
        console.log("✅ Synced refresh token: Cookie → localStorage");
      }

      // Reverse sync: localStorage to cookies (backup)
      if (localAccessToken && !cookieAccessToken) {
        this.setCookieToken(this.COOKIE_ACCESS_TOKEN, localAccessToken);
        console.log("✅ Synced access token: localStorage → Cookie");
      }

      if (localRefreshToken && !cookieRefreshToken) {
        this.setCookieToken(this.COOKIE_REFRESH_TOKEN, localRefreshToken);
        console.log("✅ Synced refresh token: localStorage → Cookie");
      }
    } catch (error) {
      console.error("❌ Error initializing tokens from cookies:", error);
    }
  }

  private static setCookieToken(name: string, value: string): void {
    try {
      CookieUtils.setCookie(name, value, {
        domain: ".learnsql.store",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: window.location.protocol === "https:",
        sameSite: "Lax",
      });
    } catch (error) {
      console.warn(`Failed to set cookie ${name}:`, error);
    }
  }

  // Debug function to check token sources
  static debugTokenSources(): {
    localStorage: { access: boolean; refresh: boolean };
    cookies: { access: boolean; refresh: boolean };
  } {
    return {
      localStorage: {
        access: !!localStorage.getItem(this.ACCESS_TOKEN_KEY),
        refresh: !!localStorage.getItem(this.REFRESH_TOKEN_KEY),
      },
      cookies: {
        access: !!CookieUtils.getCookie(this.COOKIE_ACCESS_TOKEN),
        refresh: !!CookieUtils.getCookie(this.COOKIE_REFRESH_TOKEN),
      },
    };
  }
}

// Auto-initialize tokens from cookies when module loads
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      TokenManager.initializeFromCookies();
    });
  } else {
    TokenManager.initializeFromCookies();
  }
}
