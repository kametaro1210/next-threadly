import { SubmitPostForm } from "@/components/post/submit-post-form";
import { getSessionUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SubmitPage() {

  // 現在のログインユーザー情報。未ログインの場合はnull。
  const user = await getSessionUser();

  // userがログインしていない場合、ログイン画面へリダイレクト
  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">記事を投稿</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            u/{user.username}としてログインしています。
            投稿ではコミュニティの代わりにタグを使用します。
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
      <SubmitPostForm />
    </div>
  );
}