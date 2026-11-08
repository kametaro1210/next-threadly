import { formatRelativeTime } from "@/lib/format";
import { Post, Tag, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@neondatabase/auth/react";
import { MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import { VoteButtons } from "./vote-buttons";

// ------------------------------------------------------------------------------

/*
  投稿本文を一覧表示用に短くする処理

  【処理フロー】
  1. bodyの連続した空白や改行を1つの空白にまとめ、前後の空白を取り除いてtextに保存する。
  2. textがmax（省略する文字数の上限。初期値は160文字）以内なら、textをそのまま返す。
  3. maxを超える場合は、先頭からmax文字を取り出して「…」を付けて返す。
*/

function snippet(body: string, max = 160) {
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

// ------------------------------------------------------------------------------

export function PostCard({
  post,
  author,
  tagsBySlug,
  score,
  userVote,
}: {
  post: Post;
  author: User;
  tagsBySlug: Map<string, Tag>;
  score: number;
  userVote: -1 | 0 | 1;
}) {

  // 投稿に設定されたタグslugの配列から、先頭のslugを取得
  const primarySlug = post.tagSlugs[0];
  
  // 先頭のslugに対応するタグを取得し、slugがない場合はundefinedで取得
  const primaryTag = primarySlug ? tagsBySlug.get(primarySlug) : undefined;

  return (
    <article className="flex gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:border-border">
      
      {/* 投票ボタン */}
      <VoteButtons
        target="post"
        targetId={post.id}
        score={score}
        userVote={userVote}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <UserAvatar user={author} size="sm" />
          <Link
            href={`/post/${post.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            u/{author.username}
          </Link>
          <span>·</span>

          <span>{formatRelativeTime(post.createdAt)}</span>


        </div>
        <Link href={`/post/${post.id}`} className="block">
          <h2 className="text-base font-semibold leading-snug text-foreground hover:text-primary">
            {post.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {snippet(post.body)}
          </p>
        </Link>

        {/* primaryTagがある場合はタグリンクを表示し、ない場合は何も表示しない。 */}
        {primaryTag ? (
          <div className="mt-2">
            <Link
              href={`/?tag=${encodeURIComponent(primaryTag.slug)}`}
              className={cn(
                "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                "bg-tag-bg text-tag-text",
              )}
            >
              #{primaryTag.label}
            </Link>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-4" />
            {post.commentCount} Comments
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Share2 className="size-4" />
            Share
          </button>
        </div>
      </div>
    </article>
  );
}