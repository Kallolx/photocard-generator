/**
 * Cookie management utilities for client-side cookie operations
 */

/**
 * Set a cookie with expiration in days
 */
export const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Delete all authentication cookies
 */
export const deleteAllAuthCookies = () => {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  deleteCookie('adminAccessToken');
  deleteCookie('adminRefreshToken');
};
