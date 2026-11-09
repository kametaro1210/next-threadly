import { FeedSortTabs } from "@/components/feed/feed-sord-tabs";
import { PostCard } from "@/components/feed/post-card";
import { RightTrending } from "@/components/layout/right-trending";
import { getSessionUser } from "@/lib/auth";
import { batchAuthorsForIds, listPostsSorted, listTags } from "@/lib/db/queries";
import { getTrendingToday } from "@/lib/trending";
import { FeedSort } from "@/lib/types";


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tag?: string }>;
}) {

  // URLのクエリパラメーター（sortやtag）を取得する。
  const sp = await searchParams;

  // URLで指定された並び順の値を取得する。
  const sortRaw = sp.sort;
  
  // 並び順を許可された値に限定し、未指定や不正な値は"hot"にする。
  const sort: FeedSort =
    sortRaw === "new" || sortRaw === "top" ? sortRaw : "hot";

  // URLで指定されたタグ名を小文字にして、絞り込みに使う。
  const tagFilter = sp.tag?.toLowerCase();
  
  // 現在ログインしているユーザーの情報を取得する。
  const sessionUser = await getSessionUser();

  // 並び順・タグ・ログインユーザーに基づいて投稿一覧を取得する。
  const rows = await listPostsSorted(sort, tagFilter, sessionUser?.id);

  // アプリで使用するタグ一覧を取得する。
  const tags = await listTags();

  // タグのslugをキーにして、対応するタグを検索できるMapを作る。
  const tagMap = new Map(tags.map((tag) => [tag.slug, tag]));

  // 投稿一覧から投稿者IDを取り出し、重複を除いた配列を作る。
  const authorIds = [...new Set(rows.map((r) => r.post.authorId))];

  // 投稿者IDをキーにして、投稿者情報をまとめて取得する。
  const authorById = await batchAuthorsForIds(authorIds);

  // ログインユーザーが投稿者一覧に含まれる場合、そのユーザー情報で置き換える。
  if (sessionUser && authorById.has(sessionUser.id)) {
    authorById.set(sessionUser.id, sessionUser);
  }

  // 順位・トピック名・投稿数を持つ今日のトレンド一覧を取得
  const trending = getTrendingToday();

  const cards = rows.map((row) => {
    const author = authorById.get(row.post.authorId);
    if (!author) return null;
    return (
      <PostCard
        key={row.post.id}
        post={row.post}
        author={author}
        tagsBySlug={tagMap}
        score={row.score}
        userVote={row.userVote}
      />
    );
  });

  return (
    <div className="flex items-start gap-8">
      <div className="min-w-0 flex-1">

        {/* currentに現在の並び順、tagに絞り込み用のタグslugを渡す。 */}
        <FeedSortTabs current={sort} tag={tagFilter}/>
        
        <div className="space-y-4">
          {cards}

          {/* 投稿がない場合の表示 */}
          {rows.length === 0 && (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              投稿がまだありません
            </p>
          )}
        </div>
      </div>

      <aside className="hidden w-72 shrink-0 space-y-6 lg:block">
        <RightTrending items={trending} />
      </aside>
    </div>
  );
}
