
/*
  投稿日時を現在からの経過時間に変換する処理

  【処理フロー】
  1. isoで受け取った日時と現在時刻から、経過した秒数を求める。
  2. 経過時間に応じて「たった今」「○分前」「○時間前」「○日前」「○週間前」を返す。
  3. 5週間以上前の場合は、年月日の形式で返す。
*/

export function formatRelativeTime(iso: string): string {

  // isoを日時として解釈し、1970年からの経過時間をミリ秒で取得する。
  const then = new Date(iso).getTime();

  // 現在時刻を1970年からの経過時間（ミリ秒）で取得する。
  const now = Date.now();

  // 現在時刻からisoの日時までに経過した秒数を求める。
  const sec = Math.floor((now - then) / 1000);

  // 60秒未満なら「たった今」を返す。
  if (sec < 60) return "just now";

  // 経過秒数を分に変換する。
  const min = Math.floor(sec / 60);

  // 60分未満なら「○分前」を返す。
  if (min < 60) return `${min}m ago`;

  // 経過分数を時間に変換する。
  const h = Math.floor(min / 60);

  // 24時間未満なら「○時間前」を返す。
  if (h < 24) return `${h}h ago`;

  // 経過時間を日に変換する。
  const d = Math.floor(h / 24);

  // 7日未満なら「○日前」を返す。
  if (d < 7) return `${d}d ago`;

  // 経過日数を週に変換する。
  const w = Math.floor(d / 7);

  // 5週間未満なら「○週間前」を返す。
  if (w < 5) return `${w}w ago`;

  // 5週間以上前なら、ロケールに合わせた年月日を返す。
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

  // ---------------------------------------------------------------------------

/*
  件数を短い表記に変換する処理

  【処理フロー】
  1. nが100万以上なら「m」、1,000以上なら「k」を使い、小数第1位までで返す。
  2. 1,000未満なら、nを文字列に変換して返す。
*/

export function formatCount(n: number): string {
  // nが100万以上なら、100万単位にして小数第1位までの「m」表記で返す。
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;

  // nが1,000以上なら、1,000単位にして小数第1位までの「k」表記で返す。
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;

  // nが1,000未満なら、数値をそのまま文字列にして返す。
  return String(n);
}