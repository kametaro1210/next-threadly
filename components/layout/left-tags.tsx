import { formatCount } from "@/lib/format";
import { Tag } from "@/lib/types";
import Link from "next/link";

export function LeftTags({ items }: { items: { tag: Tag; count: number }[] }) {

  // sortedには、受け取ったタグ一覧を投稿数の多い順に並べた上位8件が入る。
  // itemAとitemBは、並べ替え時に比較する「タグ情報と投稿数」の組み合わせ。
  const sorted = [...items]
    .sort((itemA, itemB) => itemB.count - itemA.count)
    .slice(0, 8);

  return (
    <ul className="space-y-2">
      {sorted.map(({ tag, count }) => (
        <li key={tag.slug}>

          {/* クリックするとトップページへ移動し、tagクエリで該当タグの記事に絞り込む。 */}
          <Link
            href={`/?tag=${encodeURIComponent(tag.slug)}`}
            className="flex items-center justify-between gap-2 rounded-md py-1 text-sm transition-colors hover:text-foreground"
          >

            {/* タグごとに固有の色（カラーコード）を割り当てる */}
            <span
              className="truncate font-medium"
              style={{ color: tag.hashColor }}
            >
              #{tag.label}
            </span>
            
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatCount(count)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}