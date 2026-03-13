import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE_NAME = "crm_session_user_id";

export async function signInWithEmailPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return null;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, String(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return user;
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const rawId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawId) return null;

  const id = Number(rawId);
  if (!Number.isFinite(id)) return null;

  return prisma.user.findUnique({
    where: { id }
  });
}

