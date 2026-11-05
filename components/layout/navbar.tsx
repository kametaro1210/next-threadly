import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@neondatabase/auth/react";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-4">
        {/* ロゴ */}
        <Link
          href="/"
          className={
            "flex items-center gap-2 font-semibold tracking-tight text-foreground"
          }
        >
          <span
            className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
            aria-hidden
          >
            T
          </span>
          <span className="text-lg">Threadly</span>
        </Link>

        {/* 検索窓 */}
        <div className="relative mx-auto hidden max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            readOnly
            placeholder="記事を検索してください..."
            className="h-10 w-full rounded-full border-border bg-card pl-10 pr-16 text-sm"
            aria-label="Search posts"
          />
        </div>

        {/* ログインしている場合のナビゲーション */}
        <SignedIn>
          {/* アウトラインの小さなボタンを、sm未満では隠してsm以上で表示する */}
          <Link
            href="/submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            新規投稿
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </Button>
          <UserButton />
        </SignedIn>

        {/* ログインしていない場合のナビゲーション */}
        <SignedOut>

          {/* 色の違いはvariantで選び、配色はcomponents/ui/button.tsxのbuttonVariantsで定義 */}
          <div className="ml-auto flex items-center gap-2">
            {/* ゴーストスタイルのログインボタンを表示する */}
            <Link
              href={"/auth/sign-in"}
              className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
              )}
            >
              Log In
            </Link>

            {/* 標準スタイルの新規登録ボタンを表示する */}
            <Link
              href={"/auth/sign-up"}
              className={cn(
                buttonVariants({ variant: "default" })
              )}
            >
              Sign Up
            </Link>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}