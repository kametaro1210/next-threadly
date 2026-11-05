/**
 * Seed tags, demo posts, threaded comments, and votes (fake author ids `seed_*`).
 *
 *   npm run db:seed
 *
 * Env:
 *   SEED_EXTRA=N       — append N procedural posts after curated ones (default 0)
 *   SEED_FORCE=1       — delete all posts, comments, votes then re-seed (destructive)
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
      "平日の夜と週末を費やして8ヶ月、ついに個人開発のサービスをリリースしました",
    body: `最初は小さなCLIツールとして始まり、気づけばフルプロダクトに成長していました。一番大変だったのはモチベーションを維持し続けることです。

まずはシンプルなv1をリリースして、そこから改善を重ねていきましょう。`,
    tagSlugs: ["webdev"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "ダッシュボードをCRAからNext.js 16に移行した理由",
    body: "Server Componentsのおかげで、予想以上にバンドルサイズを削減できました。移行には2週末かかりましたが、LCP（表示速度）の改善として十分に価値がありました。",
    tagSlugs: ["nextjs", "react"],
  },
  {
    authorId: DEMO_AUTHORS[2],
    title: "小規模なコミュニティでは「サブアット（板）」より「タグベースのフィード」の方が優れている",
    body: "階層が浅くなり、メンタルモデルもシンプルになります。カテゴリーの選択ミスが減り、タグが重複することで新しいメンバーがコンテンツを見つけやすくなります。",
    tagSlugs: ["webdev"],
  },
  {
    authorId: DEMO_AUTHORS[3],
    title: "OpenAIがGPT-5を発表 — 皆さんは何を作っていますか？",
    body: "現場で実際にどのような構成パターンが採用されているのか気になります。私たちのチームでは、ユーザー向け機能に関しては今でも「構造化出力 ＋ 人間によるレビュー」の構成を維持しています。",
    tagSlugs: ["ai", "typescript"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "ミニマルなUIキット：shadcnだけで十分なケース",
    body: "開発を始めるのに15個も依存関係を入れる必要はありません。デフォルトのデザインとトークンだけで、90%の要件はカバーできます。",
    tagSlugs: ["react", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[0],
    title: "スレッド形式のコメント：隣接リスト vs ネストセット",
    body: "私たちにとっては「隣接リスト ＋ ソートキー」の組み合わせがベストスポットでした。ネストセットはスマートですが、マイグレーションが大変です。",
    tagSlugs: ["typescript", "nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[4],
    title: "Show HN: Threadly — Server Actionsを使ったReddit風UI",
    body: "NeonベースのデータベースとNeon Authによる認証を組み合わせています。アーキテクチャについての質問があれば気軽にお答えします！",
    tagSlugs: ["nextjs", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[5],
    title: "Postgresの部分インデックスで、重かったランキングクエリが劇的に高速化",
    body: "実行時間が800msから12msになりました。決め手となったのは、「アクティブシーズン中の行」だけに絞ってインデックスを作成したことです。",
    tagSlugs: ["typescript", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[2],
    title: "Tailwind v4：1週間使ってみた第一印象",
    body: "CSSファーストの設定には最初の1日戸惑いましたが、慣れれば筋肉記憶で書けるようになります。リポジトリ内のファイル数が減るのは快適です。",
    tagSlugs: ["react", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[3],
    title: "Prismaと生SQL（Raw SQL）の使い分け基準",
    body: "通常のプロダクトコードにはORMを使い、ウィンドウ関数が必要なレポート用のクエリには `$queryRaw` を使うのがチームのルールです。",
    tagSlugs: ["typescript", "nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[4],
    title: "ダークモード：カラーコードの直書きはやめよう",
    body: "背景色と文字色の両方を綺麗に出力してくれるパレットジェネレーターを使いましょう。コントラストに関するバグが半分に減りました。",
    tagSlugs: ["webdev", "react"],
  },
  {
    authorId: DEMO_AUTHORS[2],
    title: "Next.jsにおけるEdgeとNodeランタイムの使い分け：ルートグループごとに決める",
    body: "深く考えずに混ぜて使っていたら、コールドスタートで痛い目に遭いました。シンプルな図にまとめて方針を統一しました。",
    tagSlugs: ["nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[0],
    title: "個人開発のモニタリング：ログだけでは不十分な理由",
    body: "見るべきSLOは「p95のAPIレイテンシ」の1つだけで十分です。ユーザーからクレームが来るまでは、他のデータはほとんどノイズになります。",
    tagSlugs: ["webdev", "typescript"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "大げさな構成にしない、シンプルなRAGの実装",
    body: "「チャンキング ＋ 埋め込み ＋ pgvector」の組み合わせで、実用的な社内検索が作れました。エージェントは不要でした。",
    tagSlugs: ["ai", "typescript"],
  },
  {
    authorId: DEMO_AUTHORS[2],
    title: "採用：ジュニア向けに「退屈すぎない」良い最初の一歩を用意する",
    body: "最初のタスクは、すぐ近くにメンターがいる状態で実際のコードに触れられるものが理想です。おもちゃのリポジトリは、間違った教訓しか教えてくれません。",
    tagSlugs: ["webdev"],
  },
  {
    authorId: DEMO_AUTHORS[3],
    title: "3人のチームでも私がADR（アーキテクチャ決定記録）を書き続ける理由",
    body: "未来の自分は、今の自分とは別人です。Slackの過去ログを漁るより、2段落のドキュメントの方が圧倒的に役立ちます。",
    tagSlugs: ["typescript"],
  },
  {
    authorId: DEMO_AUTHORS[4],
    title: "「/v2」のようなURL変更が嫌いな場合のAPIバージョニング戦略",
    body: "API全体ではなく、リソース単位でバージョニングを行います。破壊的変更は稀であり、ドキュメントもしっかり管理しています。",
    tagSlugs: ["webdev", "nextjs"],
  },
  {
    authorId: DEMO_AUTHORS[5],
    title: "Webアプリのキーボードショートカット：メンテナンスする価値はあるか？",
    body: "パワーユーザーから対価を得ているなら、答えは「Yes」です。私たちは `⌘K` による検索機能を実装して、そこで留めています。",
    tagSlugs: ["react", "webdev"],
  },
  {
    authorId: DEMO_AUTHORS[0],
    title: "週末プロジェクト：開発者にとってRSSはまだ死んでいない",
    body: "依存しているリポジトリのリリースノートを自動集約しています。これだけで週に1時間の節約になります。",
    tagSlugs: ["typescript", "ai"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "機能フラグ（フィーチャーフラグ）：LaunchDarkly vs オープンソース vs 環境変数",
    body: "私たちの規模であれば、環境変数とDBカラムの組み合わせで十分機能しました。エンジニアが50人を超えるまではこれで十分です。",
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
    "バンドラー",
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
      title: `コミュニティスレッド #${n}: ${topics[i % topics.length]}について`,
      body: `自動生成されたディスカッションのスタブ #${n} です。実際のコンテンツに置き換えるか、ページネーション、ソート、投票機能のテストにご活用ください。

このシリーズで扱うトピック: ${topics.join(", ")}`,
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

/** Per post: two root comments, one reply, post votes from each demo author, comment votes. */
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
        body: "サンプルコメント：軽量な構成でリリースしたときと、まさに同じ傾向が見られますね。",
      },
    });
    const top2 = await prisma.comment.create({
      data: {
        postId,
        authorId: b,
        body: "サンプル質問：実機でのビフォー・アフターの数値は計測しましたか？",
      },
    });
    await prisma.comment.create({
      data: {
        postId,
        authorId: c,
        parentId: top2.id,
        body: "サンプル返信：私たちは WebPageTest とミドルレンジのスマホ実機プロファイルを組み合わせて計測しました。",
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
      `投稿をスキップします（すでにDBに ${existing} 件存在します）。全ての投稿・コメント・投票を削除して再シードするには、SEED_FORCE=1 を設定してください。`,
    );
    return;
  }

  if (existing > 0 && force) {
    console.log("SEED_FORCE: 既存の投稿、コメント、投票を削除しています…");
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
    `合計 ${allPosts.length} 件の投稿をシード中（キュレート ${CURATED_POSTS.length} 件 ＋ 追加 ${procedural.length} 件）…`,
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