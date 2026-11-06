
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

export type FeedSort = "hot" | "new" | "top";