
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { getSessionUser } from "@/lib/auth";
import { tagPostCounts } from "@/lib/db/queries";

export default async function CoreGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // ログイン中のユーザー情報が入る。未ログインの場合はnull。
  const user = await getSessionUser();

  // 各タグの情報と、そのタグが付いた投稿数の一覧が入る。
  const tags = await tagPostCounts();

  return (
    <>
      <Navbar />
      <div className="mx-auto flex max-w-[1200px] gap-8 px-4 pb-16 pt-2">

        {/*
          showCta:未ログインかどうかを表す真偽値を渡す。
          tagsWithCounts:タグ情報と投稿数の配列を渡す。
        */}
        <LeftSidebar showCta={!user} tagsWithCounts={tags} />

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}