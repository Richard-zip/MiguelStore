import { cookies } from "next/headers"

const COOKIE_NAME = "admin_session"

// A lightweight token derived from the password so the cookie value is not the raw password.
function getSessionToken() {
  const password = process.env.ADMIN_PASSWORD ?? ""
  // Simple deterministic token. Not cryptographic, but the raw password never leaves the server.
  return Buffer.from(`gorras-admin:${password}`).toString("base64")
}

export async function isAdmin() {
  const store = await cookies()
  const session = store.get(COOKIE_NAME)?.value
  return !!session && session === getSessionToken()
}

export async function signInAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || password !== expected) {
    return false
  }
  const store = await cookies()
  store.set(COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return true
}

export async function signOutAdmin() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
