import { prisma } from "../prisma";
import { PostModel } from './../generated/prisma/models/Post';
import { FeedSort, Post, Tag, User } from './../types';


/*
  コメントは後ほど記載
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

export async function listTags(): Promise<Tag[]> {
  const rows = await prisma.tag.findMany({ orderBy: { slug: "asc" } });
  return rows.map((tag) => ({
    slug: tag.slug,
    label: tag.label,
    hashColor: tag.hashColor,
  }));
}

export type FeedPostRow = {
  post: Post;
  score: number;
  userVote: -1 | 0 | 1;
};


export async function listPostsSorted(
  sort: FeedSort,
  tagFilter: string | undefined,
  // userId: string | undefined,
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

  const [tagMap] = await Promise.all([tagsForPosts(ids)])

  const mapped = postRows.map((row) => {
    const slugs = tagMap.get(row.id) ?? [];
    return {
      post : mapPostRow(row, slugs, 65),
      VoteScore : 2,
      created : row.createdAt.getTime(),
      useVote : 1
    };
  });


  if (sort === "new") {
    mapped.sort((left, right) => right.created - left.created);
  } else if (sort === "top") {
    mapped.sort(
      (left, right) =>
        // right.voteScore - left.voteScore ||
        right.post.commentCount - left.post.commentCount ||
        right.created - left.created,
    );
  } else {
    console.log("実装中");

    // mapped.sort((left, right) => {
    //   const rHot = right.voteScore + 2 * right.post.commentCount;
    //   const lHot = left.voteScore + 2 * left.post.commentCount;
    //   return (
    //     rHot - lHot || right.created - left.created
    //   );
  //   });
  }

  return mapped.map((item) => ({
    post: item.post,
    score: item.voteScore,
    userVote: item.userVote,
  }));

}

async function tagsForPosts(postIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();

  if (postIds.length === 0) return map;

  const rows = await prisma.postTag.findMany({
    where: { postId: { in: postIds } },
  });

  for (const pid of postIds) map.set(pid, []);

  for (const row of rows) {
    const list = map.get(row.postId) ?? [];
    list.push(row.tagSlug);
    map.set(row.postId, list);
  }

  return map;
}

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