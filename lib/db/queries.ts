import { EnrichedCommentNode, nestCommentRows } from "../comment-tree";
import { PostModel } from "../generated/prisma/models";
import { prisma } from "../prisma";
import { Comment, FeedSort, Post, Tag, User, VoteTarget } from "../types";

/*
  複数ユーザーの情報をまとめて取得する処理

  【引数】
  - authorIds：情報を取得したいユーザーのID一覧。

  【処理フロー】
  1. authorIdsから重複を除き、同じユーザーを何度も検索しないようにする。
  2. 取得対象が0件なら、空のMapを返す。
  3. PrismaでIDがuniqueに含まれるユーザーを検索する（whereのinは、一覧のいずれかと一致する条件）。
  4. 検索結果をIDからユーザー情報を引けるMapにする。DBにないIDには表示用の仮のユーザー名を設定する。
  5. ユーザーIDをキー、ユーザー情報を値にしたMapを返す。
*/

export async function batchAuthorsForIds(
  authorIds: string[],
): Promise<Map<string, User>> {
  const unique = [...new Set(authorIds)];
  if (unique.length === 0) return new Map();

  const rows = await prisma.userProfile.findMany({
    where: { id: { in: unique } },
  });

  const result = new Map<string, User>();

  for (const row of rows) {
    result.set(row.id, { id: row.id, username: row.username });
  }

  for (const id of unique) {
    if (!result.has(id)) {
      result.set(id, { id, username: `user_${id.slice(0, 6)}` });
    }
  }

  return result;
}

  // ----------------------------------------------------------------------------------

/*
  タグ一覧を取得する処理 

  【引数】
  - なし。

  【処理フロー】
  1. Prismaでタグをすべて検索する（where条件はなく、slugの昇順に並べる）。 
  2. 各行からslug（識別子）・label（表示名）・hashColor（表示色）を取り出す。
  3. 画面表示などで使うTag型の配列を返す。 
*/

export async function listTags(): Promise<Tag[]> { 
  const rows = await prisma.tag.findMany({ orderBy: { slug: "asc" } });
  return rows.map((tag) => ({
    slug: tag.slug, 
    label: tag.label,
    hashColor: tag.hashColor,
  }));
} 

  // ----------------------------------------------------------------------------------

/*
  条件に合う投稿を取得し、フィード用に並べる処理

  【引数】
  - sort：投稿の並び順（新着順・投票数順・注目順）。
  - tagFilter：絞り込むタグのslug。undefinedの場合はタグで絞り込まない。
  - userId：ログインユーザーのID。undefinedの場合はユーザーごとの投票を取得しない。

  【処理フロー】
  1. tagFilterがある場合は小文字にし、投稿にそのタグが1つ以上付いている条件を作る。
      ない場合はタグで絞り込まない。
  2. Prismaで条件に合う投稿を作成日時の新しい順に最大50件取得する。
  3. 取得した投稿IDをidsにまとめる。投稿が0件なら、空の配列を返す。
  4. idsを使い、投稿ごとのタグ（tagMap）・コメント数（ccMap）
      ・投票合計（vsMap）・ログインユーザーの投票（uvMap）を並行して取得する。
  5. 各投稿行に対応する値をMapから取り出す。
      該当する値がない場合、タグは空配列、件数・スコア・投票は0としてPost型にまとめる。
  6. sortが"new"なら作成日時の新しい順、"top"なら投票合計の高い順（同点はコメント数、作成日時順）、
      それ以外は投票合計＋コメント数×2の高い順（同点は作成日時順）に並べる。
  7. 投稿・投票スコア・ログインユーザーの投票値を持つ配列を返す。並び替えは取得した最大50件の中で行う。
*/

export type FeedPostRow = {
  post: Post;
  score: number;
  userVote: -1 | 0 | 1;
};

export async function listPostsSorted(
  sort: FeedSort,
  tagFilter: string | undefined,
  userId: string | undefined,
): Promise<FeedPostRow[]> {
    const where = tagFilter
      ? { postTags: { some: { tagSlug: tagFilter.toLowerCase() } } }
      : undefined;
      
    const postRows = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const ids = postRows.map((p) => p.id);
    if (ids.length === 0) return [];

    const [tagMap, ccMap, vsMap, uvMap] = await Promise.all([
      tagsForPosts(ids),
      commentCountsForPosts(ids),
      voteSumsForPosts(ids),
      userVotesForPosts(userId, ids),
    ]);

    const mapped = postRows.map((row) => {
      const slugs = tagMap.get(row.id) ?? [];
      const cc = ccMap.get(row.id) ?? 0;
      const vs = vsMap.get(row.id) ?? 0;
      return {
        post: mapPostRow(row, slugs, cc),
        voteScore: vs,
        created: row.createdAt.getTime(),
        userVote: uvMap.get(row.id) ?? 0,
      };
    });

    if (sort === "new") {
      mapped.sort((feedA, feedB) => feedB.created - feedA.created);
    } else if (sort === "top") {
      mapped.sort(
        (feedA, feedB) =>
          feedB.voteScore - feedA.voteScore ||
          feedB.post.commentCount - feedA.post.commentCount ||
          feedB.created - feedA.created,
      );
    } else {
      mapped.sort((feedA, feedB) => {
        const hotB = feedB.voteScore + 2 * feedB.post.commentCount;
        const hotA = feedA.voteScore + 2 * feedA.post.commentCount;
        return hotB - hotA || feedB.created - feedA.created;
      });
    }

    return mapped.map((feed) => ({
      post: feed.post,
      score: feed.voteScore,
      userVote: feed.userVote,
    }));
}

  // ----------------------------------------------------------------------------------

/*
  投稿ごとのタグ一覧を取得する処理

  【引数】
  - postIds：タグ一覧を取得する投稿のID一覧。

  【処理フロー】
  1. postIdsが空なら、空のMapを返す。
  2. PrismaでpostIdがpostIdsのいずれかと一致するPostTagを検索する。
  3. 全投稿IDに空のタグ一覧を先に用意し、検索した行のtagSlugを対応する投稿の一覧に追加する。
      タグのない投稿も空配列で扱える。
  4. 投稿IDをキー、タグslugの配列を値にしたMapを返す。
*/

async function tagsForPosts(postIds: string[]): Promise<Map<string, string[]>> {
  const m = new Map<string, string[]>();
  if (postIds.length === 0) return m;
  const rows = await prisma.postTag.findMany({
    where: { postId: { in: postIds } },
  });
  for (const pid of postIds) m.set(pid, []);
  for (const r of rows) {
    const list = m.get(r.postId) ?? [];
    list.push(r.tagSlug);
    m.set(r.postId, list);
  }
  return m;
}

  // ----------------------------------------------------------------------------------

/*
  タグごとの投稿数を集計する処理

  【引数】
  - なし。

  【処理フロー】
  1. 表示対象となるタグ一覧を取得する。
  2. PrismaでPostTagをtagSlugごとにグループ化し、各タグに紐づく投稿数を数える。
  3. 集計結果をタグslugから件数を引けるMapにする。投稿がないタグは件数を0にする。
  4. 各タグ情報と件数を組み合わせた配列を返す。
*/

export async function tagPostCounts(): Promise<{ tag: Tag; count: number }[]> {
  const allTags = await listTags();
  const rows = await prisma.postTag.groupBy({
    by: ["tagSlug"],
    _count: { _all: true },
  });
  const countMap = new Map(rows.map((r) => [r.tagSlug, r._count._all]));
  return allTags.map((tag) => ({
    tag,
    count: countMap.get(tag.slug) ?? 0,
  }));
}

  // ----------------------------------------------------------------------------------

/*
  複数投稿のコメント数を集計する処理

  【引数】
  - postIds：コメント数を集計する投稿のID一覧。

  【処理フロー】
  1. postIdsが空なら、空のMapを返す。
  2. PrismaでpostIdがpostIdsのいずれかと一致するコメントを検索し、postIdごとに全件数を集計する。
  3. 集計結果を、投稿IDをキー・その投稿のコメント数を値にしたMapにして返す。コメントがない投稿はMapに含まれないため、利用側で0として扱う。
*/

async function commentCountsForPosts(
  postIds: string[],
): Promise<Map<string, number>> {
  if (postIds.length === 0) return new Map();
  const rows = await prisma.comment.groupBy({
    by: ["postId"],
    where: { postId: { in: postIds } },
    _count: { _all: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) {
    m.set(r.postId, r._count._all);
  }
  return m;
}

  // ----------------------------------------------------------------------------------

/*
  IDを指定して投稿を取得する処理 

  【引数】
  - id：取得したい投稿のID。 

  【処理フロー】
  1. Prismaで投稿IDが引数idと一致する投稿を1件検索する。見つからなければundefinedを返す。 
  2. 投稿が見つかった場合、そのIDを使ってタグ一覧とコメント数を取得する。 
  3. 投稿のDBデータにタグslugとコメント数を加え、アプリ内で使うPost型に変換して返す。
*/

export async function getPostById(id: string): Promise<Post | undefined> { 
  const row = await prisma.post.findUnique({ where: { id } });
  if (!row) return undefined;

  const [tagMap, ccMap] = await Promise.all([ 
    tagsForPosts([id]),
    commentCountsForPosts([id]),
  ]);

  return mapPostRow(row, tagMap.get(id) ?? [], ccMap.get(id) ?? 0); 
}

  // ----------------------------------------------------------------------------------

/*
  IDを指定して投稿者情報を取得する処理 

  【引数】
  - authorId：情報を取得したい投稿者のユーザーID。 

  【処理フロー】
  1. PrismaでユーザーIDがauthorIdと一致するユーザーを1件検索する。 
  2. 見つかった場合はDBのIDとユーザー名を返す。見つからない場合は引数のIDと、その一部を使った仮のユーザー名を返す。
*/

export async function getAuthorById(authorId: string): Promise<User> { 
  const row = await prisma.userProfile.findUnique({ where: { id: authorId } });
  return row
    ? { id: row.id, username: row.username }
    : { id: authorId, username: `user_${authorId.slice(0, 6)}` }; 
}

  // ----------------------------------------------------------------------------------

/*
  投稿の投票スコアを取得する処理 

  【引数】
  - postId：投票スコアを取得したい投稿のID。 

  【処理フロー】
  1. PrismaでtargetTypeが"post"かつtargetIdがpostIdの投票だけを対象にする。
  2. 対象のvalueを合計し、投票がない場合（合計がnull）は0にして数値で返す。 
*/
export async function getPostScore(postId: string): Promise<number> { 
  const agg = await prisma.vote.aggregate({
    where: { targetType: "post", targetId: postId },
    _sum: { value: true },
  });
  return Number(agg._sum.value ?? 0); 
}

  // ----------------------------------------------------------------------------------

/*
  複数投稿の投票スコアをまとめて取得する処理

  【引数】
  - postIds：投票スコアを集計する投稿のID一覧。

  【処理フロー】
  1. postIdsが空なら、空のMapを返す。
  2. PrismaでtargetTypeが"post"かつtargetIdがpostIdsに含まれる投票を、
      targetId（投稿ID）ごとに合計する。
  3. 集計結果を投稿IDから投票スコアを引けるMapにして返す。
      合計値がnullの場合は0にする。
      投票のない投稿はMapに含まれないため、利用側で0として扱う。
*/

async function voteSumsForPosts(
  postIds: string[],
): Promise<Map<string, number>> {
  if (postIds.length === 0) return new Map();
  const rows = await prisma.vote.groupBy({
    by: ["targetId"],
    where: {
      targetType: "post",
      targetId: { in: postIds },
    },
    _sum: { value: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) {
    m.set(r.targetId, Number(r._sum.value ?? 0));
  }
  return m;
}

  // ----------------------------------------------------------------------------------

/*
  複数投稿に対するログインユーザーの投票を取得する処理

  【引数】
  - userId：投票したユーザーのID。undefinedの場合は未ログイン。
  - postIds：ユーザーの投票を確認する投稿のID一覧。

  【処理フロー】
  1. userIdがない（未ログイン）、またはpostIdsが空なら、空のMapを返す。
  2. PrismaでuserIdが一致し、targetTypeが"post"、
      targetIdがpostIdsに含まれる投票を検索する。
  3. 投稿IDをキー、投票値（-1は反対、1は賛成）を値にしたMapを返す。
      投票のない投稿はMapに含まれず、利用側で0として扱う。
*/

async function userVotesForPosts(
  userId: string | undefined,
  postIds: string[],
): Promise<Map<string, -1 | 0 | 1>> {
  const map = new Map<string, -1 | 0 | 1>();
  if (!userId || postIds.length === 0) return map;
  const rows = await prisma.vote.findMany({
    where: {
      userId,
      targetType: "post",
      targetId: { in: postIds },
    },
  });
  for (const row of rows) {
    const val = row.value;
    map.set(row.targetId, val === -1 || val === 1 ? val : 0);
  }
  return map;
}

  // ----------------------------------------------------------------------------------

/*
  複数コメントの投票スコアをまとめて取得する処理

  【引数】
  - commentIds：投票スコアを集計するコメントのID一覧。

  【処理フロー】
  1. commentIdsが空なら、空のMapを返す。
  2. PrismaでtargetTypeが"comment"かつtargetIdがcommentIdsに含まれる投票を、
      targetId（コメントID）ごとに合計する。
  3. 集計結果をコメントIDから投票スコアを引けるMapにして返す。
      合計値がnullの場合は0にする。
      投票のないコメントはMapに含まれず、利用側で0として扱う。
*/

async function batchCommentScores(
  commentIds: string[],
): Promise<Map<string, number>> {
  if (commentIds.length === 0) return new Map();
  const rows = await prisma.vote.groupBy({
    by: ["targetId"],
    where: {
      targetType: "comment",
      targetId: { in: commentIds },
    },
    _sum: { value: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) {
    m.set(r.targetId, Number(r._sum.value ?? 0));
  }
  return m;
}

  // ----------------------------------------------------------------------------------

/*
  複数コメントに対するユーザーの投票を取得する処理

  【引数】
  - userId：投票したユーザーのID。
  - commentIds：ユーザーの投票を確認するコメントのID一覧。

  【処理フロー】
  1. commentIdsが空なら、空のMapを返す。
  2. PrismaでuserIdとtargetTypeが"comment"で一致し、
      targetIdがcommentIdsに含まれる投票を検索する。
  3. コメントIDをキー、投票値（-1は反対、1は賛成）を値にしたMapを返す。
      投票のないコメントはMapに含まれず、利用側で0として扱う。
*/

async function batchUserVotesForComments(
  userId: string,
  commentIds: string[],
): Promise<Map<string, -1 | 0 | 1>> {
  const m = new Map<string, -1 | 0 | 1>();
  if (commentIds.length === 0) return m;
  const rows = await prisma.vote.findMany({
    where: {
      userId,
      targetType: "comment",
      targetId: { in: commentIds },
    },
  });
  for (const r of rows) {
    const v = r.value;
    m.set(r.targetId, v === -1 || v === 1 ? v : 0);
  }
  return m;
}

  // ----------------------------------------------------------------------------------

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

  // ----------------------------------------------------------------------------------

/*
  ユーザーが対象に投票した値を取得する処理 

  【引数】
  - userId：投票したユーザーのID。undefinedの場合は未ログイン。
  - type：投票対象の種類（投稿またはコメント）。 
  - targetId：投票対象となる投稿またはコメントのID。

  【処理フロー】
  1. userIdがない（未ログイン）場合は、投票なしを表す0を返す。 
  2. PrismaでuserId・targetType（type）・targetIdがすべて一致する投票を1件検索する。
  3. 投票値が-1または1ならその値を返し、投票がない場合やそれ以外の値の場合は0を返す。 
*/

export async function getUserVote( 
  userId: string | undefined,
  type: VoteTarget,
  targetId: string, 
): Promise<-1 | 0 | 1> {
  if (!userId) return 0;

  const row = await prisma.vote.findUnique({ 
    where: {
      userId_targetType_targetId: {
        userId,
        targetType: type,
        targetId, 
      },
    },
  }); 

  const voteValue = row?.value;

  return voteValue === -1 || voteValue === 1 ? voteValue : 0; 
}

  // ----------------------------------------------------------------------------------

/*
  投稿のコメントを投票・投稿者情報付きのツリーにする処理 

  【引数】
  - postId：コメントを取得する投稿のID。
  - sessionUserId：ログインユーザーのID。省略時はユーザーごとの投票を取得しない。

  【処理フロー】
  1. postIdに属するコメント一覧を取得し、0件なら空の配列を返す。 
  2. コメントから重複のない投稿者IDとコメントIDを作り、
      それぞれ投稿者情報と投票スコアを取得する。
  3. sessionUserIdがある場合はそのユーザーの各コメントへの投票も取得し、 
      ない場合は全コメントを投票なし（0）として扱う。
  4. 各コメントに投稿者・スコア・本人の投票を加える。
    投稿者情報を取得できないコメントは除外する。 
  5. nestCommentRowsでparentIdを使って返信を親コメントのchildrenにまとめ、
      親子関係のツリーを返す。
*/

export async function getCommentTree( 
  postId: string,
  sessionUserId?: string,
): Promise<EnrichedCommentNode[]> {
  const flat = await listCommentsForPost(postId); 
  if (flat.length === 0) return [];
  const authorIds = [...new Set(flat.map((comment) => comment.authorId))];
  const authorMap = await batchAuthorsForIds(authorIds); 

  const commentIds = flat.map((comment) => comment.id);
  const scoreMap = await batchCommentScores(commentIds);
  const voteMap = sessionUserId
    ? await batchUserVotesForComments(sessionUserId, commentIds)
    : new Map<string, -1 | 0 | 1>(); 

  const enriched = flat
    .map((comment) => {
      const author = authorMap.get(comment.authorId);
      if (!author) return null;

      return {
        ...comment,
        author, 
        score: scoreMap.get(comment.id) ?? 0,
        userVote: (voteMap.get(comment.id) ?? 0) as -1 | 0 | 1,
      };
    })
    .filter( 
      (enrichedComment): enrichedComment is NonNullable<typeof enrichedComment> =>
        enrichedComment !== null,
    );

  return nestCommentRows(enriched); 
}

  // ----------------------------------------------------------------------------------

/*
  指定した投稿のコメント一覧を取得する処理

  【引数】
  - postId：コメントを取得する投稿のID。

  【処理フロー】
  1. PrismaでpostIdが引数postIdと一致するコメントをすべて検索する
    （この検索では並び順を指定していない）。
  2. 各行からComment型で使う項目を取り出し、createdAtをISO形式の文字列に変換した配列を返す。
*/

export async function listCommentsForPost(postId: string): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({ where: { postId } });
  return rows.map((commentRow) => ({
    id: commentRow.id,
    postId: commentRow.postId,
    authorId: commentRow.authorId,
    parentId: commentRow.parentId,
    body: commentRow.body,
    createdAt: commentRow.createdAt.toISOString(),
  }));
}