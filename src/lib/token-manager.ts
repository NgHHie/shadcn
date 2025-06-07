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

      console.log("📋 Token status check:", {
        cookie: {
          access: !!cookieAccessToken,
          refresh: !!cookieRefreshToken,
        },
        localStorage: {
          access: !!localAccessToken,
          refresh: !!localRefreshToken,
        },
      });

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

      // Log final status
      const finalStatus = this.debugTokenSources();
      console.log("🏁 Final token status:", finalStatus);
    } catch (error) {
      console.error("❌ Error initializing tokens from cookies:", error);
    }
  }

  static getAccessToken(): string | null {
    // Try localStorage first (faster)
    let token = localStorage.getItem(this.ACCESS_TOKEN_KEY);

    // If not in localStorage, try cookie
    if (!token) {
      token = CookieUtils.getCookie(this.COOKIE_ACCESS_TOKEN);
      if (token) {
        // Sync to localStorage for future use
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
        // Sync to localStorage for future use
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

  private static setCookieToken(name: string, value: string): void {
    try {
      CookieUtils.setCookie(name, value, {
        domain: ".learnsql.store", // Shared across subdomains
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: window.location.protocol === "https:",
        sameSite: "Lax",
      });
    } catch (error) {
      console.warn(`Failed to set cookie ${name}:`, error);
    }
  }

  static clearTokens(): void {
    // Clear localStorage
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);

    // Clear cookies
    CookieUtils.removeCookie(this.COOKIE_ACCESS_TOKEN);
    CookieUtils.removeCookie(this.COOKIE_REFRESH_TOKEN);

    console.log("🗑️ Cleared tokens from both localStorage and cookies");
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
        "https://api.learnsql.store/api/app/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.token || data.accessToken) {
        const newAccessToken = data.token || data.accessToken;
        const newRefreshToken = data.refreshToken || refreshToken;

        this.setTokens(newAccessToken, newRefreshToken);
        console.log("✅ Access token refreshed successfully");

        return newAccessToken;
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // If refresh fails, clear all tokens and redirect to login
      this.clearTokens();

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      throw error;
    }
  }

  // Check if tokens are available (from any source)
  static hasValidTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
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
