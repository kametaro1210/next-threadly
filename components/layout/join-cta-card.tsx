import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function JoinCtaCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div
          className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/15 text-2xl"
          aria-hidden
        >
          🤖
        </div>
        <CardTitle className="text-base">会話に参加しよう!</CardTitle>
        <CardDescription className="text-muted-foreground">
          投稿を作成したり、投票したり、気になるタグをフォローしたりできます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/auth/sign-up"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full justify-center",
          )}
        >
          Sign up
        </Link>
      </CardContent>
    </Card>
  );
}