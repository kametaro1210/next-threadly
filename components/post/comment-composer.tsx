"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createCommentAction } from "@/lib/actions/comments";
import { User } from "@/lib/types";
import { UserAvatar } from "@neondatabase/auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export function CommentComposer({
  postId,
  user,
  parentId = null,
  placeholder = "コメントを入力してください",
  compact = false,
}: {
  postId: string;
  user: User;
  parentId?: string | null;
  placeholder?: string;
  compact?: boolean;
}) {
  
  // useRefでフォーム要素を覚えておき、必要なときにフォーム自体へアクセスできるようにする。
  const formRef = useRef(null);

  // コメント送信時のエラーメッセージ。エラーがなければnull。
  const [error, setError] = useState<string | null>(null);

  // コメント送信処理が進行中かどうかと、非同期処理を開始する関数。
  const [pending, startTransition] = useTransition();

  // 送信成功後に現在のページを再取得・再描画するためのルーター。
  const router = useRouter();

  // --------------------------------------------------------------------------------------

  /*
    コメント送信時の処理

    【引数】
    - e：送信されたフォームの情報。

    【処理フロー】
    1. ブラウザー標準の送信動作を止め、前回のエラーを消す。
    2. formにフォーム要素、fdに入力値（投稿ID・返信先ID・本文）をまとめて受け取る。
    3. fdを使ってコメントを保存し、失敗した場合はエラーを表示する。
    4. 成功した場合は入力欄を空にし、router.refresh()で現在のページを再取得して表示を更新する。
  */

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const res = await createCommentAction(null, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  }

  // --------------------------------------------------------------------------------------

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex gap-3">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="parentId" value={parentId ?? ""} />
      <UserAvatar
        user={user}
        size={compact ? "sm" : "default"}
        className="mt-1 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-2">

        {/* コンパクト表示は2行、通常表示は3行。 */}
        <Textarea
          name="body"
          required
          placeholder={placeholder}
          rows={compact ? 2 : 3} 
          className="min-h-0 resize-y border-border bg-card text-sm"
        />
        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}