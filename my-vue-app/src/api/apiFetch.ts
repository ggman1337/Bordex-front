// src/api/apiFetch.ts
export function getAccessTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  // Для всех запросов кроме логина и регистрации добавлять credentials: 'include'
  const url = typeof input === 'string' ? input : input.url
  if (!/auth\/login|auth\/register/.test(url)) {
    init.credentials = 'include'
  }
  return fetch(input, init)
}
