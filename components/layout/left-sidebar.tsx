"use client";

import { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flame, Home, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { JoinCtaCard } from "./join-cta-card";
import { LeftTags } from "./left-tags";

const m_nav = [
  { 
    href: "/", 
    label: "Home", 
    icon: Home, 
    match: "home" as const 
  },
  { 
    href: "/?sort=hot", 
    label: "Popular", 
    icon: Flame, 
    match: "hot" as const 
  },
  {
    href: "/?sort=new",
    label: "All Posts",
    icon: LayoutGrid,
    match: "new" as const,
  },
];

export function LeftSidebar({
  showCta,
  tagsWithCounts,
}: {
  // ログインしていない状態(true)なら参加案内カードを表示する。
  showCta: boolean;
  // タグ情報と、そのタグが付いた投稿数の一覧。LeftTagsに渡して表示する。
  tagsWithCounts: { tag: Tag; count: number }[];
}) {

// 現在のURLのパス名を取得する（例: "/posts" など）
  const pathname = usePathname();

  // URLの「?」以降にくっついている検索条件やパラメータのデータ全体を丸ごと取得する
  const sp = useSearchParams();
  
  // 取得した検索条件の中から、「sort」という項目に指定された値（並び順のルールなど）を取り出す
  const sort = sp.get("sort");

  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <nav className="space-y-1 pr-2">

        {/* Homeはsortがhot/new/top以外、Popularはsort=hot、
        All Postsはsort=newのとき選択状態にする（いずれもpathnameが "/" の場合） */}
        {m_nav.map(({ href, label, icon: Icon, match }) => {
          const active =
            match === "home"
              ? pathname === "/" &&
                sort !== "hot" &&
                sort !== "new" &&
                sort !== "top"
              : match === "hot"
                ? pathname === "/" && sort === "hot"
                : match === "new"
                  ? pathname === "/" && sort === "new"
                  : false;

          return (
            <Link
              key={match}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "border-primary bg-muted/60 text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Top Tags
        </p>

        <LeftTags items={tagsWithCounts}/>
      </div>

      {/* showCtaがtrue（未ログイン時）のみ、参加案内カードを表示 */}
      {showCta && (
        <div className="mt-8">
          <JoinCtaCard />
        </div>
      )}
    </aside>
  );
}