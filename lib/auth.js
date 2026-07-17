export const SITE_COOKIE = 'pmaudits_site_ok'
export const ADMIN_COOKIE = 'pmaudits_admin_ok'
export const COOKIE_VALUE = 'granted'

// No maxAge — these are session cookies. The browser drops them when it's
// fully closed, so the password is required again on the next visit rather
// than staying signed in for weeks.
