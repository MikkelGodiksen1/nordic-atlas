import { cookies } from 'next/headers';

const COOKIE_NAME = 'na_admin';

export function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set');
  }
  return password;
}

export async function isAdmin() {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;
  try {
    return value === getAdminPassword();
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;
