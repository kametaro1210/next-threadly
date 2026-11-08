/**
 * タグ、デモ投稿、スレッド形式のコメント、投票のシードデータを投入します（ダミーの作者ID `seed_*`）。
 *
 *   npm run db:seed
 *
 * 環境変数:
 *   SEED_EXTRA=N  — キュレーションされた投稿の後ろにN件の手続き型投稿を追加します（デフォルト 0）
 *   SEED_FORCE=1  — すべての投稿、コメント、投票を削除してから再シードします（破壊的）
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";

const DEMO_AUTHORS = [
  "seed_auth_alice",
  "seed_auth_bob",
  "seed_auth_clara",
  "seed_auth_dev",
  "seed_auth_erin",
  "seed_auth_frank",
];

type SeedPost = {
  authorId: string;
  title: string;
  body: string;
  tagSlugs: string[];
};

const CURATED_POSTS: SeedPost[] = [
  {
    authorId: DEMO_AUTHORS[0],
    title:
      "平日夜と週末に8ヶ月かけて開発した個人開発プロジェクトをリリースしました",
    body: `小さなCLIツールとして始まり、フルプロダクトに成長しました。一番大変だったのは継続することでした。

まずはシンプルなv1をリリースして、そこからイテレーションを回しましょう。`,
    tagSlugs: ["webdev"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "ダッシュボードをCRAからNext 16に移行した理由",
    body: "Server Componentsのおかげで、予想以上にバンドルサイズを削減できました。移行には週末2回かかりましたが、LCPの改善として十分に報われました。",
    tagSlugs: ["nextjs", "react"],
  },
  {
    authorId: DEMO_AUTHORS[2],
    title: "小規模コミュニティでは「サブレッドディット」よりも「タグベースのフィード」が良い",
    body: "壁が少なく、メンタルモデルがシンプルになります。間違ったフォーラムを選ぶよりも、タグが重なっている方が新規メンバーはコンテンツを素早く見つけられます。",
    tagSlugs: ["webdev"],
  },
  {
    authorId: DEMO_AUTHORS[3],
    title: "OpenAIがGPT-5を発表 — 皆さんは何を作っていますか？",
    body: "どのようなプロダクションパターンに落ち着いているのか気になります。私たちのチームでは、ユーザー向け機能にはいまだに構造化出力 ＋ 人間によるレビューを採用しています。",
    tagSlugs: ["ai", "typescript"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "ミニマルなUIキット：shadcnで十分なケース",
    body: "開発を始めるのに15個もの依存関係は必要ありません。デフォルト設定とデザイントークンだけで90%の要件を満たせました。",
    tagSlugs: ["react", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[0],
    title: "スレッド形式のコメント：隣接リスト vs ネストされたセット",
    body: "私たちにとっては、隣接リスト ＋ ソートキーの組み合わせがベストスポットでした。ネストされたセットは巧妙ですが、マイグレーションが大変です。",
    tagSlugs: ["typescript", "nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[4],
    title: "Show HN: Threadly — Server Actionsを使ったReddit風UI",
    body: "Neonをバックエンドに、認証はNeon Authを使用しています。アーキテクチャについての質問があれば気軽にどうぞ。",
    tagSlugs: ["nextjs", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[5],
    title: "Postgresのパーシャルインデックスで重いリーダーボードクエリが高速化",
    body: "800msから12msに短縮されました。シーズン中のアクティブな行のみをインデックス化するパターンが勝利の鍵でした。",
    tagSlugs: ["typescript", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[2],
    title: "Tailwind v4：1週間使ってみた第一印象",
    body: "CSSファーストの設定には最初の1日戸惑いましたが、すぐに筋肉記憶に定着しました。リポジトリ内のファイル数が減るのが嬉しいです。",
    tagSlugs: ["react", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[3],
    title: "Prismaと生SQLの使い分けの基準",
    body: "プロダクトコードにはORMを使い、ウィンドウ関数が必要な集計パスには$queryRawを使っています。これがチームのルール・オブ・サムです。",
    tagSlugs: ["typescript", "nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[4],
    title: "ダークモード：hexの組み合わせを勘で決めるのをやめる",
    body: "両方のサーフェスを出力できるパレットジェネレーターを選びましょう。コントラストに関するバグが半分に減りました。",
    tagSlugs: ["webdev", "react"],
  },
  {
    authorId: DEMO_AUTHORS[5],
    title: "Next.jsのEdge vs Nodeランタイム — ルートグループごとに選ぶ",
    body: "深く考えずに混在させると、コールドスタートのサプライズに悩まされます。簡単な図を描いてそれに従うようにしました。",
    tagSlugs: ["nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[0],
    title: "個人開発のオブザーバビリティ：ログだけでは不十分",
    body: "SLOは1つ：p95のAPIレイテンシ。ユーザーから苦情が出るまでは、それ以外のすべてはノイズにすぎません。",
    tagSlugs: ["webdev", "typescript"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "大掛かりな仕組みを入れないRAG（検索拡張生成）",
    body: "チャンキング ＋ 埋め込み ＋ pgvectorで実用的な社内検索が作れました。エージェントは不要です。",
    tagSlugs: ["ai", "typescript"],
  },
  {
    authorId: DEMO_AUTHORS[2],
    title: "採用：見下された気分にならない、ジュニア向けの良い初級タスク",
    body: "良いファーストイシューは、Zoomですぐに連絡できるメンターのサポートのもと、実際のコードパスに触れるものであるべきです。おもちゃのリポジトリは間違った教訓を与えてしまいます。",
    tagSlugs: ["webdev"],
  },
  {
    authorId: DEMO_AUTHORS[3],
    title: "3人のチームでもADR（アーキテクチャ決定記録）を書き続ける理由",
    body: "未来の自分もまた、今の自分とは別の人間です。Slackの過去ログを漁るよりも、2段落のドキュメントのほうが役立ちます。",
    tagSlugs: ["typescript"],
  },
  {
    authorId: DEMO_AUTHORS[4],
    title: "`/v2`という命名が嫌いな人のためのAPIバージョニング",
    body: "API全体ではなく、リソース単位でバージョン管理をしています。破壊的変更は稀であり、ドキュメント化されています。",
    tagSlugs: ["webdev", "nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[5],
    title: "Webアプリのキーボードショートカット：メンテナンスする価値はあるか？",
    body: "パワーユーザーが対価を払ってくれるなら「はい」。私たちは⌘K検索を実装してそこで留めています。",
    tagSlugs: ["react", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[0],
    title: "週末プロジェクト：開発者にとってRSSはまだ死んでいない",
    body: "依存しているリポジトリのリリースノートを集約しています。週に1時間の節約になります。",
    tagSlugs: ["typescript", "ai"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "フィーチャーフラグ：LaunchDarkly vs オープンソース vs 環境変数トグル",
    body: "私たちの規模では、環境変数 ＋ DBカラムで十分機能しました。エンジニアが50人を超えてくると状況は変わるでしょう。",
    tagSlugs: ["webdev", "typescript"],
  },
];

function proceduralPosts(count: number, offset: number): SeedPost[] {
  const topics = [
    "デプロイ",
    "テスト",
    "開発者体験(DX)",
    "パフォーマンス",
    "セキュリティ",
    "アクセシビリティ",
    "バンエラー",
    "状態管理",
  ];
  const out: SeedPost[] = [];
  for (let i = 0; i < count; i++) {
    const n = offset + i + 1;
    const authorId = DEMO_AUTHORS[i % DEMO_AUTHORS.length];
    const tagSlugs =
      i % 3 === 0
        ? ["nextjs", "react"]
        : i % 3 === 1
          ? ["webdev"]
          : ["typescript", "ai"];
    out.push({
      authorId,
      title: `コミュニティスレッド #${n}: ${topics[i % topics.length]}`,
      body: `シードされたディスカッションのスタブ #${n} です。実際のコンテンツに置き換えるか、ページネーション、ソート、投票機能のテストにご活用ください。

このシリーズでカバーしているトピック: ${topics.join(", ")}。`,
      tagSlugs,
    });
  }
  return out;
}

async function seedTags() {
  const tagRows = [
    { slug: "webdev", label: "webdev", hashColor: "#7193FF" },
    { slug: "react", label: "react", hashColor: "#FFB000" },
    { slug: "nextjs", label: "nextjs", hashColor: "#46D160" },
    { slug: "typescript", label: "typescript", hashColor: "#FF585B" },
    { slug: "ai", label: "ai", hashColor: "#FF4500" },
  ];
  await prisma.tag.createMany({
    data: tagRows,
    skipDuplicates: true,
  });
}

async function insertPost(data: SeedPost) {
  const slugs = data.tagSlugs.length ? data.tagSlugs : ["webdev"];
  await prisma.tag.createMany({
    data: slugs.map((slug) => ({
      slug,
      label: slug,
      hashColor: "#FFB000",
    })),
    skipDuplicates: true,
  });

  const post = await prisma.post.create({
    data: {
      authorId: data.authorId,
      title: data.title,
      body: data.body,
    },
  });
  await prisma.postTag.createMany({
    data: slugs.map((tagSlug) => ({ postId: post.id, tagSlug })),
  });
  return post.id;
}

type VoteSeed = {
  userId: string;
  targetType: "post" | "comment";
  targetId: string;
  value: number;
};

/** 投稿ごと：ルートコメント2件、返信1件、各デモ作者からの投稿投票、コメント投票 */
async function seedCommentsAndVotes(postIds: string[]) {
  if (postIds.length === 0) return;

  const votes: VoteSeed[] = [];

  for (let idx = 0; idx < postIds.length; idx++) {
    const postId = postIds[idx];
    const a = DEMO_AUTHORS[idx % DEMO_AUTHORS.length];
    const b = DEMO_AUTHORS[(idx + 2) % DEMO_AUTHORS.length];
    const c = DEMO_AUTHORS[(idx + 4) % DEMO_AUTHORS.length];

    const top1 = await prisma.comment.create({
      data: {
        postId,
        authorId: a,
        body: "シードコメント：より小規模なスタックでリリースした際に見られた傾向と一致しています。",
      },
    });
    const top2 = await prisma.comment.create({
      data: {
        postId,
        authorId: b,
        body: "シード質問：実機でビフォーアフターの測定を行いましたか？",
      },
    });
    await prisma.comment.create({
      data: {
        postId,
        authorId: c,
        parentId: top2.id,
        body: "シードネスト返信 — WebPageTestとミドルレンジのスマートフォンプロファイルを使用しました。",
      },
    });

    for (let v = 0; v < DEMO_AUTHORS.length; v++) {
      votes.push({
        userId: DEMO_AUTHORS[v],
        targetType: "post",
        targetId: postId,
        value: v % 3 === 0 ? -1 : 1,
      });
    }

    votes.push(
      {
        userId: DEMO_AUTHORS[0],
        targetType: "comment",
        targetId: top1.id,
        value: 1,
      },
      {
        userId: DEMO_AUTHORS[1],
        targetType: "comment",
        targetId: top1.id,
        value: 1,
      },
      {
        userId: DEMO_AUTHORS[2],
        targetType: "comment",
        targetId: top2.id,
        value: -1,
      },
      {
        userId: DEMO_AUTHORS[3],
        targetType: "comment",
        targetId: top2.id,
        value: 1,
      },
    );
  }

  await prisma.vote.createMany({
    data: votes,
    skipDuplicates: true,
  });
}

async function main() {
  console.log("タグをシード中…");
  await seedTags();

  const force = process.env.SEED_FORCE === "1";
  const existing = await prisma.post.count();

  if (existing > 0 && !force) {
    console.log(
      `投稿のシードをスキップします（すでにDBに ${existing} 件存在します）。すべての投稿・コメント・投票を削除して再シードするには SEED_FORCE=1 を設定してください。`,
    );
    return;
  }

  if (existing > 0 && force) {
    console.log("SEED_FORCE: 投稿、コメント、投票を削除中…");
    await prisma.vote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.postTag.deleteMany();
    await prisma.post.deleteMany();
  }

  const extra = Math.max(0, parseInt(process.env.SEED_EXTRA ?? "0", 10) || 0);
  const procedural =
    extra > 0 ? proceduralPosts(extra, CURATED_POSTS.length) : [];
  const allPosts = [...CURATED_POSTS, ...procedural];

  console.log(
    `${allPosts.length} 件の投稿をシード中（キュレーション ${CURATED_POSTS.length} 件 + 追加 ${procedural.length} 件）…`,
  );

  const postIds: string[] = [];
  for (const p of allPosts) {
    postIds.push(await insertPost(p));
  }

  console.log("コメントと投票をシード中…");
  await seedCommentsAndVotes(postIds);

  console.log("完了しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });