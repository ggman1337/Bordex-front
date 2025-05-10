// utils/cookies.ts
// Утилита для очистки нераспознанных cookie по всему проекту

/**
 * Очищает все cookie, которые не входят в whitelist.
 * @param allowedWhitelist - массив разрешённых имён cookie
 */
export function clearUnknownCookies(allowedWhitelist: string[] = ['session', 'auth', 'theme']) {
  if (typeof document === 'undefined') return
  document.cookie.split(';').forEach(cookie => {
    const [rawName] = cookie.split('=')
    const name = rawName.trim()
    if (name && !allowedWhitelist.includes(name)) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
  })
}
