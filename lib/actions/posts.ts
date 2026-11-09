"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "../auth";
import { getUserVote } from "../db/queries";
import { PostModel } from "../generated/prisma/models";
import { prisma } from "../prisma";
import { Post } from "../types";

/*
  投稿への投票を受け付けるServer Action

  【引数】
  - postId：投票対象となる投稿のID。
  - value：投票値。1は賛成、-1は反対。

  【処理フロー】
  1. ログインユーザーのIDを取得し、未ログインならエラーを返す。
  2. votePostを呼び出し、ログインユーザーの投票を登録・解除する。
  3. トップページと対象投稿の詳細ページのキャッシュを更新する。
*/

export async function votePostAction(postId: string, value: -1 | 1) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "Sign in to vote." };
  }

  await votePost(userId, postId, value);
  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
}

// -------------------------------------------------------------------------------

/*
  投稿への投票を登録または解除する処理

  【引数】
  - userId：投票するユーザーのID。
  - postId：投票対象となる投稿のID。
  - value：今回選択した投票値。1は賛成、-1は反対。

  【処理フロー】
  1. 登録済みの投票値を取得する。
  2. すでに今回と同じ値で投票済みなら、次の値を0（投票なし）にする。
    そうでなければ、次の値を今回の投票値にする。
  3. Prismaで、ユーザーID・対象種類が"post"・対象IDがpostIdに一致する投票を削除する。
  4. 次の値が0でなければ、新しい投票レコードを作成する。0なら作成せず投票解除の状態にする。
*/

export async function votePost(
  userId: string,
  postId: string,
  value: -1 | 1,
): Promise<void> {
  const current = await getUserVote(userId, "post", postId);
  let next: -1 | 0 | 1 = value;
  if (current === value) next = 0;

  await prisma.vote.deleteMany({
    where: {
      userId,
      targetType: "post",
      targetId: postId,
    },
  });

  if (next !== 0) {
    await prisma.vote.create({
      data: {
        userId,
        targetType: "post",
        targetId: postId,
        value: next,
      },
    });
  }
}

// --------------------------------------------------------------------------------

/*
  フォームから投稿を作成するServer Action

  【引数】
  - _prev：前回のフォーム状態。PostFormState型で、
      エラーメッセージを持つオブジェクトまたはnull。
      この関数では前回の状態を参照しない。
  - formData：フォームから送られるタイトル・本文・タグ文字列。

  【処理フロー】
  1. ログインユーザーのIDを取得し、未ログインならPostFormState型のエラーを返す。
  2. formDataからタイトル・本文・タグ文字列を取り出す。
  3. タイトルの前後の空白を除いた長さが4文字未満なら、
      エラーメッセージを持つPostFormStateを返す。
  4. タグ文字列をカンマ・#・空白で分割し、小文字に変換して最大5件にする。
  5. addPostを呼び出し、ログインユーザーを投稿者として投稿を保存する。
  6. トップページと投稿フォームページのキャッシュを更新し、作成した投稿の詳細ページへ移動する。
*/

export type PostFormState = { error?: string } | null;

export async function createPostAction( 
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "You must be signed in to post." };
  }

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "");

  if (title.trim().length < 4) {
    return { error: "Title is too short." };
  }

  const tagSlugs = tagsRaw
    .split(/[,#\s]+/)
    .map((s) => s.trim().toLowerCase())
    .slice(0, 5);

  const post = await addPost({
    authorId: userId,
    title,
    body,
    tagSlugs,
  });

  revalidatePath("/");
  revalidatePath("/submit");
  redirect(`/post/${post.id}`);
}

// ----------------------------------------------------------------------------

/*
  投稿と投稿に付けるタグをデータベースに作成する処理

  【引数】
  - input.authorId：投稿者のユーザーID。
  - input.title：投稿タイトル。
  - input.body：投稿本文。
  - input.tagSlugs：投稿に付けるタグのslug一覧。

  【処理フロー】
  1. tagSlugsが空なら、既定のタグ"webdev"を使う。
  2. Prismaでタグをまとめて作成する。slugと同じ値をlabelに設定し、
    すでに存在するslugはskipDuplicatesにより作成をスキップする。
  3. PrismaでPostレコードを作成する。タイトルと本文の前後の空白を除いて保存する。
  4. 作成した投稿IDとタグslugを使い、PrismaでPostTagレコードをまとめて作成する。
  5. 作成した投稿・タグ一覧・コメント数0をPost型にまとめて返す。
*/

export async function addPost(input: {
  authorId: string;
  title: string;
  body: string;
  tagSlugs: string[];
}): Promise<Post> {
  const tagSlugs = input.tagSlugs.length ? input.tagSlugs : ["webdev"];
  await prisma.tag.createMany({
    data: tagSlugs.map((slug) => ({
      slug,
      label: slug,
      hashColor: "#ff00fb",
    })),
    skipDuplicates: true,
  });

  const row = await prisma.post.create({
    data: {
      authorId: input.authorId,
      title: input.title.trim(),
      body: input.body.trim(),
    },
  });

  await prisma.postTag.createMany({
    data: tagSlugs.map((slug) => ({
      postId: row.id,
      tagSlug: slug,
    })),
  });

  return mapPostRow(row, tagSlugs, 0);
}

// ----------------------------------------------------------------------------

/*
  Prismaの投稿データをアプリ内のPost型に変換する処理

  【引数】
  - row：Prismaから取得した投稿データ。
  - tagSlugs：その投稿に付いているタグのslug一覧。
  - commentCount：その投稿に付いているコメントの件数。

  【処理フロー】
  1. 投稿データrowの各項目とtagSlugs・commentCountをPost型の項目に割り当てる。
  2. createdAtはDateからISO形式の文字列に変換し、Post型のデータを返す。
*/

function mapPostRow(
  row: PostModel,
  tagSlugs: string[],
  commentCount: number,
): Post {
  return {
    id: row.id,
    authorId: row.authorId,
    title: row.title,
    body: row.body,
    tagSlugs,
    createdAt: row.createdAt.toISOString(),
    commentCount,
  };
}