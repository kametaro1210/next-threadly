import { createNeonAuth } from "@neondatabase/auth/next/server";
import { cache } from "react";

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
