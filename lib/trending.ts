
export type TrendingItem = { 
  rank: number; 
  title: string; 
  postCount: string 
};

export function getTrendingToday(): TrendingItem[] {
  return [
      { rank: 1, title: "OpenAIがGPT-5を発表", postCount: "1.24万件" },
      { rank: 2, title: "Next.js 16のアプリパターン", postCount: "8,200件" },
      { rank: 3, title: "タグがコミュニティより優れている理由", postCount: "5,100件" },
      { rank: 4, title: "個人開発（サイドプロジェクト）のリリース", postCount: "3,400件" },
      { rank: 5, title: "本番環境でのサーバーアクション", postCount: "2,900件" },
    ];
}