import { FeedSort } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

// -----------------------------------------------------------------------------------

/*
  並び順とタグを指定したページURLを作る処理

  【処理フロー】
  1. sort（並び順）とtag（任意のタグ）を引数で受け取る。
  2. URLSearchParamsでURLのクエリパラメーターを組み立てる入れ物を作る。
  3. sortが初期値の"hot"以外ならsortを追加し、tagがあればtagも追加する。
  4. 追加したパラメーターをqに文字列化し、値があれば「/?...」、なければ「/」を返す。
*/

function hrefFor(sort: FeedSort, tag?: string) {
  const params = new URLSearchParams();
  if (sort !== "hot") params.set("sort", sort);
  if (tag) params.set("tag", tag);
  const q = params.toString();
  return q ? `/?${q}` : "/";
}

// -----------------------------------------------------------------------------------

export function FeedSortTabs({
  current,
  tag,
}: {
  current: FeedSort;
  tag?: string;
}) {

  // タブの設定情報（識別子ID、表示ラベル、アイコン）の配列を取得
  const tabs: { id: FeedSort; label: string; icon: typeof Flame }[] = [
    { id: "hot", label: "Hot", icon: Flame },
    { id: "new", label: "New", icon: Sparkles },
    { id: "top", label: "Top", icon: TrendingUp },
  ];

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex gap-1">

        {/* iconをJSXで使うためIconという名前で受け取る。 */}
        {tabs.map(({ id, label, icon: Icon }) => {

          // 選択しているタブとidが一致している場合、ボタンを点火する
          const active = current === id;

          return (
            <Link
              key={id}
              href={hrefFor(id, tag)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}