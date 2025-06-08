import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/data";

export const setStorageByName = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getStorageByName = (key) => {
  const item = localStorage.getItem(key);
  try {
    return JSON.parse(item);
  } catch (e) {
    return item;
  }
};

export const removeStorageByName = (key) => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
};

export const clearAllStorage = () => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
};

export const setCookie = (key, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${key}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

export const getCookie = (key) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(key + "="))
    ?.split("=")[1];
};

export const removeCookie = (key) => {
  document.cookie = `${key}=; Max-Age=0; path=/`;
};

export const getAuthenticator = () => {
  return getStorageByName(ACCESS_TOKEN);
};

export const getRefreshToken = () => {
  return getStorageByName(REFRESH_TOKEN);
};

export const setAuthenticator = (value) => {
  setStorageByName(ACCESS_TOKEN, value);
  setCookie(ACCESS_TOKEN, value);
};

export const setRefreshToken = (value) => {
  setStorageByName(REFRESH_TOKEN, value);
  setCookie(REFRESH_TOKEN, value);
};

export const clearAccessToken = () => {
  removeStorageByName(ACCESS_TOKEN);
  removeCookie(ACCESS_TOKEN);
};
