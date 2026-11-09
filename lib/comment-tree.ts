import { Comment, User } from "./types";

/*
  投稿者・投票情報を含むコメントツリーの型

  【目的】
  コメントの表示に必要な情報と、返信の一覧をまとめる。

  【使われ方】
  nestCommentRowsが返すコメントの型として使う。
  childrenには、そのコメントへの返信が入る。
*/

export type EnrichedCommentNode = {
  id: string;
  postId: string; 
  parentId: string | null;
  body: string; 
  createdAt: string;
  authorId: string;
  author: User; 
  score: number;
  userVote: -1 | 0 | 1; 
  children: EnrichedCommentNode[];
};

// -----------------------------------------------------------------------

/*
  投稿者・投票情報付きのコメント一覧をツリーに変換する処理

  【入力】
  - EnrichedCommentRow：Commentの項目に、投稿者情報・投票スコア・ユーザー自身の投票値を加えた型。
  - flat：ツリー化するコメント一覧。親子関係は各コメントのparentIdで表す。

  【処理フロー】
  1. flatの各コメントを、返信一覧childrenが空のEnrichedCommentNodeに変換し、IDをキーにMapへ登録する。
  2. 各コメントのparentIdを確認する。親コメントがMapにあれば、そのchildrenに追加する。
    返信先がない、または一覧にない場合はルートのコメントとして扱う。
  3. ルートと各階層の返信を、作成日時の古い順に並べる。
  4. ルートコメントの配列を返す。各コメントのchildrenに返信が入ったツリーになっている。
*/

export type EnrichedCommentRow = Comment & {
  author: User;
  score: number;
  userVote: -1 | 0 | 1;
};

export function nestCommentRows(
  flat: EnrichedCommentRow[],
): EnrichedCommentNode[] {
  const map = new Map<string, EnrichedCommentNode>();
  for (const c of flat) {
    map.set(c.id, {
      id: c.id,
      postId: c.postId,
      parentId: c.parentId,
      body: c.body,
      createdAt: c.createdAt,
      authorId: c.authorId,
      author: c.author,
      score: c.score,
      userVote: c.userVote,
      children: [],
    });
  }

// -----------------------------------------------------------------------

  /*
    コメントを親コメントと返信に分ける処理

    【処理フロー】
    1. flatの各コメントについて、IDから対応するノードをMapから取得する。
    2. parentIdがあり、そのIDのノードもMapにある場合は、親ノードのchildrenに追加する。
    3. それ以外は親コメントとしてrootsに追加する。
  */

  const roots: EnrichedCommentNode[] = [];
  for (const c of flat) {
    const node = map.get(c.id);
    if (!node) continue;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

// -----------------------------------------------------------------------

  /*
    コメントと返信を作成日時の古い順に並べる処理

    【引数】
    - nodes：並び替えるコメントノードの一覧。

    【処理フロー】
    1. nodesをcreatedAtの古い順に並べる。
    2. 各ノードのchildrenにも同じ処理を行い、すべての階層の返信を並べる。
  */

  const sortCh = (nodes: EnrichedCommentNode[]) => {
    nodes.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    for (const n of nodes) sortCh(n.children);
  };

  // ルートコメントと各階層の返信を作成日時の古い順に並べる。
  sortCh(roots);

// -----------------------------------------------------------------------

  // 返信をchildrenにまとめた、ルートコメントの一覧を返す。
  return roots;
}