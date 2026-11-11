// Demo-only auth. These are public test credentials for hackathon judges and
// are printed on the login page. The session cookie is not signed and grants
// nothing server-side: all app data is mocked in the browser. Replace this
// module with real auth before handling real user data.

export const DEMO_ACCOUNT = {
  email: 'demo@flowpilot.dev',
  password: 'kiroween-demo',
} as const

export const SESSION_COOKIE = 'fp_session'
export const SESSION_VALUE = 'demo'
const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60

export const HOME_AFTER_LOGIN = '/workflows'

export function checkCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password
}

/**
 * Only same-site paths are allowed as a post-login target (no "//host",
 * no backslashes, no scheme), which prevents open redirects.
 */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return HOME_AFTER_LOGIN
  }
  if (value === '/login' || value.startsWith('/login?')) return HOME_AFTER_LOGIN
  return value
}

/** Browser only. */
export function startSession(): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SESSION_COOKIE}=${SESSION_VALUE}; Path=/; Max-Age=${SESSION_MAX_AGE_S}; SameSite=Lax${secure}`
}

/** Browser only. */
export function endSession(): void {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}
