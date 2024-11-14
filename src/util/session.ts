import { cache } from "react";
import { cookies } from "next/headers";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

import type { Session, User } from "@/db/schema";
import {
  getCurrentSession,
  getUserInfoWithoutPassword,
  insertSessionInDb,
} from "@/db/query";

export const SESSION_COOKIE_NAME = "auth-session";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function createSession(
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId: userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };

  await insertSessionInDb(session);

  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const sessionInDb = await getCurrentSession(sessionId);

  if (!sessionInDb) {
    return { session: null, user: null };
  }

  if (Date.now() >= sessionInDb.expiresAt.getTime()) {
    await invalidateSession(sessionInDb.id);
    return { session: null, user: null };
  }

  const userInfo = await getUserInfoWithoutPassword(sessionInDb);

  if (!userInfo) {
    await invalidateSession(sessionInDb.id);
    return { session: null, user: null };
  }

  return { session: sessionInDb, user: userInfo };
}

export const getAuthSession = cache(
  async (): Promise<SessionValidationResult> => {
    //When upgrading to Next15 await cookie() beofre modifying
    const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value ?? null;

    if (sessionToken === null) {
      return { session: null, user: null };
    }

    const result = await validateSessionToken(sessionToken);
    return result;
  },
);

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  //When upgrading to Next15 await cookie() beofre modifying and
  //make func async with Promise return
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function deleteSessionTokenCookie(): void {
  //When upgrading to Next15 await cookie() beofre modifying and
  //make func async with Promise return
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(users.id, userId));
}

export async function deleteExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
}
