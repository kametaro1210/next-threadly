
/*
  Thredly内でユーザー情報を扱うための型

  【目的】
  投稿者を画面に表示するために必要な情報の形を定義する。

  【使われ方】
  投稿カードなどでユーザー名やアバターを表示するときに使う。
  displayNameとavatarUrlは任意の情報で、ない場合もある。
*/

export type User = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
};

  // --------------------------------------------------------------------------

/*
  Thredly内でタグ情報を扱うための型

  【目的】
  タグの識別や画面表示に必要な情報の形を定義する。

  【使われ方】
  タグ名の表示や、slugを使った投稿の絞り込みに使う。
  slugは識別用の文字列、labelは画面に表示する名前、
  hashColorはタグの色を表す。
*/

export type Tag = {
  slug: string;
  label: string;
  hashColor: string;
};

  // --------------------------------------------------------------------------

/*
  Thredly内で投稿情報を扱うための型

  【目的】
  投稿の内容や表示に必要な情報の形を定義する。

  【使われ方】
  フィードや投稿カードで、投稿者との関連付け、本文・タグ・日時・
  コメント数の表示に使う。tagSlugsには投稿に付いたタグの識別子が入り、
  createdAtには投稿日時が文字列で入る。
*/

export type Post = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  tagSlugs: string[];
  createdAt: string;
  commentCount: number;
};

  // --------------------------------------------------------------------------

/*
  Thredly内でコメント情報を扱うための型

  【目的】
  コメントの内容や表示に必要な情報の形を定義する。

  【使われ方】
  投稿へのコメントや返信の表示に使う。
  parentIdがnullの場合は投稿へのコメント、値がある場合は返信を表す。
*/

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
};

  // --------------------------------------------------------------------------

/*
  フィードの並び順を表す型

  【目的】
  フィードに使う並び順を指定する。

  【使われ方】
  "hot"（注目順）、"new"（新着順）、"top"（投票数順）から選ぶ。
*/

export type FeedSort = "hot" | "new" | "top";

  // --------------------------------------------------------------------------

/*
  投票先の種類を表す型

  【目的】
  投票する対象が投稿かコメントかを区別する。

  【使われ方】
  "post"または"comment"を指定して、対象に応じた投票処理に使う。
*/

export type VoteTarget = "post" | "comment";