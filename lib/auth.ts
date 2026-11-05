import { createNeonAuth } from "@neondatabase/auth/next/server";
import { cache } from "react";
import { ensureUserProfile } from "./db/user-profile";
import { User } from "./types";

/**
 * 認証機能の初期化
 *
 * 【目的】環境変数の設定を使ってNeon Authを準備し、認証機能を使えるようにする。
 * 【受け取る値】認証サービスのURLとCookieを保護する秘密鍵（どちらも環境変数）。
 * 【返す値】セッション取得や認証APIの処理に使うauthオブジェクト。
 */

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

// -------------------------------------------------------------------------------

/**
 * 現在のログインユーザーIDを取得
 *
 * 【受け取る値】関数の引数はなし。ログイン情報はauth.getSession()が現在のリクエストから取得する。
 * 【返す値】Promise<string | undefined>。Promiseは後から結果が届くことを表し、
 *          ログイン中はユーザーID、未ログインならundefinedになる。
 * 【処理】セッションからユーザーIDを取り出す。
 *         Reactのcacheは同じサーバー処理中の重複呼び出しで結果を再利用する仕組みで、別のリクエストには持ち越さない。
 */

export const getCurrentUserId = cache(async (): Promise<string | undefined> => {
  const { data: session } = await auth.getSession();
  return session?.user.id;
});

// -------------------------------------------------------------------------------

/**
 * セッションからアプリ用ユーザー情報を取得
 *
 * 【目的】ログイン中のユーザーをアプリ内で使える形式にして返す。
 * 【受け取る値】関数の引数はなし。auth.getSession()が現在のリクエストからログイン情報を取得する。
 * 【返す値】Promise<User | null>。Promiseは後から結果が届くことを表し、
 *          ログイン中はアプリ用ユーザー情報、未ログインならnullになる。
 * 【処理】ログイン中ならensureUserProfileでプロフィールを取得し、
 *         未作成の場合は作成する。Reactのcacheは同じサーバー処理中の重複呼び出しで結果を再利用する。
 */

export const getSessionUser = cache(async (): Promise<User | null> => {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  return ensureUserProfile(session.user);
});
