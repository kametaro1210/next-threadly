"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "../auth";
import { getUserVote } from "../db/queries";
import { prisma } from "../prisma";
import { Comment } from "../types";

export type CommentFormState = { error?: string; ok?: boolean } | null;

/*
  フォームからコメントを作成するServer Action

  【引数】
  - _prev：前回のフォーム状態。Actionの引数として受け取るが、この処理では使用しない。
  - formData：フォームから送られる投稿ID・返信先ID・コメント本文。

  【処理フロー】
  1. ログインユーザーのIDを取得し、未ログインならエラーを返す。
  2. formDataから投稿ID・返信先ID・本文を文字列として取り出す。
  3. 投稿IDがない、または本文が空白だけならエラーを返す。
  4. 返信先IDが空または"null"ならnullにし、それ以外は返信先IDとして扱う。
  5. addCommentを呼び出してコメントを保存する。作成者IDにはログインユーザーのIDを使う。
  6. 投稿詳細ページとトップページのキャッシュを更新し、成功状態を返す。
*/

export async function createCommentAction(
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "You must be signed in to comment." };
  }

  const postId = String(formData.get("postId") ?? "");
  const parentIdRaw = String(formData.get("parentId") ?? "");
  const body = String(formData.get("body") ?? "");

  if (!postId || body.trim().length < 1) {
    return { error: "Comment cannot be empty." };
  }

  const parentId = parentIdRaw && parentIdRaw !== "null" ? parentIdRaw : null;

  await addComment({ postId, authorId: userId, parentId, body });

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  return { ok: true };
}

// --------------------------------------------------------------------------------

/*
  コメントをデータベースに作成する処理

  【引数】
  - input.postId：コメント先となる投稿のID。
  - input.authorId：コメントを書いたユーザーのID。
  - input.parentId：返信先コメントのID。投稿へのコメントの場合はnull。
  - input.body：保存するコメント本文。

  【処理フロー】
  1. PrismaでCommentレコードを作成する。本文の前後の空白は取り除いて保存する。
  2. 作成されたレコードからコメント情報を組み立て、日時をISO形式の文字列に変換して返す。
*/

export async function addComment(input: {
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
}): Promise<Comment> {
  const row = await prisma.comment.create({
    data: {
      postId: input.postId,
      authorId: input.authorId,
      parentId: input.parentId,
      body: input.body.trim(),
    },
  });

  return {
    id: row.id,
    postId: row.postId,
    authorId: row.authorId,
    parentId: row.parentId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

// --------------------------------------------------------------------------------

/*
  コメントへの投票を受け付けるServer Action

  【引数】
  - commentId：投票対象となるコメントのID。
  - value：投票値。1は賛成、-1は反対。

  【処理フロー】
  1. ログインユーザーのIDを取得し、未ログインならエラーを返す。
  2. Prismaで対象コメントを検索する。コメントがなければエラーを返す。
  3. voteCommentを呼び出し、ログインユーザーの投票を登録・解除する。
  4. コメントが属する投稿詳細ページとトップページのキャッシュを更新する。
*/

export async function voteCommentAction(commentId: string, value: -1 | 1) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "Sign in to vote." };
  }
  const row = await findCommentById(commentId);
  if (!row) return { error: "Comment not found." };
  await voteComment(userId, commentId, value);
  revalidatePath(`/post/${row.postId}`);
  revalidatePath("/");
}

// --------------------------------------------------------------------------------

/*
  コメントへの投票を登録または解除する処理

  【引数】
  - userId：投票するユーザーのID。
  - commentId：投票対象となるコメントのID。
  - value：今回選択した投票値。1は賛成、-1は反対。

  【処理フロー】
  1. 登録済みの投票値を取得する。
  2. すでに今回と同じ値で投票済みなら、次の値を0（投票なし）にする。
    そうでなければ、次の値を今回の投票値にする。
  3. Prismaで、ユーザーID・対象種類が"comment"・対象IDがcommentIdに一致する投票を削除する。
  4. 次の値が0でなければ、新しい投票レコードを作成する。0なら作成せず投票解除の状態にする。
*/

export async function voteComment(
  userId: string,
  commentId: string,
  value: -1 | 1,
): Promise<void> {
  const current = await getUserVote(userId, "comment", commentId);
  let next: -1 | 0 | 1 = value;
  if (current === value) next = 0;
  await prisma.vote.deleteMany({
    where: {
      userId,
      targetType: "comment",
      targetId: commentId,
    },
  });
  if (next !== 0) {
    await prisma.vote.create({
      data: {
        userId,
        targetType: "comment",
        targetId: commentId,
        value: next,
      },
    });
  }
}

// --------------------------------------------------------------------------------

/*
  IDを指定してコメントを検索する処理

  【引数】
  - id：取得したいコメントのID。

  【処理フロー】
  1. PrismaでIDが一致するコメントを1件検索する。
  2. 見つからなければundefinedを返す。
  3. 見つかった場合はComment型の項目を取り出し、日時をISO形式の文字列にして返す。
*/

export async function findCommentById(
  id: string,
): Promise<Comment | undefined> {
  const c = await prisma.comment.findUnique({ where: { id } });
  if (!c) return undefined;
  return {
    id: c.id,
    postId: c.postId,
    authorId: c.authorId,
    parentId: c.parentId,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
  };
}