import { prisma } from "../prisma";
import { User } from "../types";

/*
  ユーザー名の生成処理

  【目的】
  Neon Authの名前をもとに、アプリで使うユーザー名を作成する。

  【処理フロー】
  1. 引数name（Neon Authの名前）の空白を取り、小文字にする。
  2. 英数字以外を「_」に置き換え、20文字までにする。空なら"user"にする。
  3. suffix（重複を避けるためのランダムな文字列）を末尾に付けて返す。
*/

function generateUsername(name: string): string {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 20) || "user";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}_${suffix}`;
}

/*
  ユーザープロフィールの取得・作成処理

  【目的】
  Neon Authのユーザー情報を、アプリ内で使うプロフィール形式にする。

  【処理フロー】
  1. 引数neonから、id（認証ID）、name（表示名）、image（画像URL）を受け取る。
  2. neon.idでDBを検索し、結果をexistingに受け取る。未登録ならnull。
  3. 登録済みなら、existingのid・usernameとname・imageでUserを作って返す。
  4. 未登録ならusernameを生成し、neon.idとともにDBへ登録する。作成結果はrowに入る。
  5. rowのid・usernameとname・imageでUserを返す。imageがなければavatarUrlはundefined。
*/

export async function ensureUserProfile(neon: {
  id: string;
  name: string;
  image?: string | null;
}): Promise<User> {
  const existing = await prisma.userProfile.findUnique({
    where: { id: neon.id },
  });

  if (existing) {
    return {
      id: existing.id,
      username: existing.username,
      displayName: neon.name,
      avatarUrl: neon.image ?? undefined,
    };
  }

  const row = await prisma.userProfile.create({
    data: { id: neon.id, username: generateUsername(neon.name) },
  });

  return {
    id: row.id,
    username: row.username,
    displayName: neon.name,
    avatarUrl: neon.image ?? undefined,
  };
}