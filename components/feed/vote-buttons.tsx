"use client";

import { voteCommentAction } from "@/lib/actions/comments";
import { votePostAction } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

// 投票先として指定できる種類（投稿またはコメント）。
type VoteTarget = "post" | "comment";

export function VoteButtons({
  target,
  targetId,
  score,
  userVote,
}: {
  target: VoteTarget;
  targetId: string;
  score: number;
  userVote: -1 | 0 | 1;
}) {

  // pendingは投票処理中かどうか、startTransitionは処理を開始する関数。
  const [pending, startTransition] = useTransition();

  // routerは、投票後に現在のページを再読み込みするための機能。
  const router = useRouter();

  // targetが"post"なら投稿への投票、それ以外ならコメントへの投票として扱う。
  const isPost = target === "post";

  // 投稿用またはコメント用の投票アイコンのサイズを指定するクラス。
  const iconClass = isPost ? "size-6" : "size-4";

  // 投稿用またはコメント用の投票ボタン全体の配置・余白・文字サイズを指定するクラス。
  const stackClass = isPost
    ? "flex flex-col items-center gap-0.5 py-1 text-sm"
    : "flex flex-col items-center gap-0 text-xs";

  // 投稿用またはコメント用の投票スコアの幅・配置・文字スタイルを指定するクラス。
  const scoreClass = isPost
    ? "min-w-[2ch] text-center text-xs font-semibold tabular-nums"
    : "min-w-[1.5ch] text-center font-medium tabular-nums";

  // --------------------------------------------------------------------------

  /*
    投票先に応じて投票処理を呼び出す関数

    【引数】
    - value：投票値。1は賛成、-1は反対。

    【処理フロー】
    1. 投票処理をTransitionとして開始し、処理中はpendingをtrueにする。
    2. isPostがtrueなら投稿への投票を処理するvotePostAction、
      falseならコメントへの投票を処理するvoteCommentActionを呼び出す。
      どちらにも投票対象のID（targetId）と投票値（value）を渡す。
    3. 処理後にrouter.refresh()で現在のルートのデータを再取得し、表示を更新する。
      ※ブラウザー全体の再読み込みではない。
  */

  function vote(value: -1 | 1) {
    startTransition(async () => {
      if (isPost) {
        await votePostAction(targetId, value);
      } else {
        await voteCommentAction(targetId, value);
      }
      router.refresh();
    });
  }

  // --------------------------------------------------------------------------

  return (
    <div className={stackClass}>
      <button
        onClick={() => vote(1)}
        disabled={pending}
        className={cn(
          "rounded p-0.5 transition-colors hover:bg-muted disabled:opacity-50",
          userVote === 1
            ? "text-upvote"
            : "text-muted-foreground hover:text-upvote",
        )}
        aria-label={isPost ? "Upvote" : "Upvote comment"}
      >
        <ChevronUp className={iconClass} />
      </button>

      <span
        className={cn(
          scoreClass,
          userVote === 1 && "text-upvote",
          userVote === -1 && "text-downvote",
        )}
      >
        {score}
      </span>

      <button
        onClick={() => vote(-1)}
        disabled={pending}
        className={cn(
          "rounded p-0.5 transition-colors hover:bg-muted disabled:opacity-50",
          userVote === -1
            ? "text-downvote"
            : "text-muted-foreground hover:text-downvote",
        )}
        aria-label={isPost ? "Downvote" : "Downvote comment"}
      >
        <ChevronDown className={iconClass} />
      </button>
    </div>
  );
}