"use client";

import { createPostAction } from "@/lib/actions/posts";
import { useActionState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function SubmitPostForm() {
  const [state, action, pending] = useActionState(createPostAction, null);

  return (
    <form action={action} className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={4}
          placeholder="記事のタイトルを入力してください"
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">記事本文</Label>
        <Textarea
          id="body"
          required
          name="body"
          rows={8}
          placeholder="記事を記述してください"
          className="border-border bg-card"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          required
          name="tags"
          placeholder="例:webdev, react, nextjs"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          カンマ区切り。空欄の場合は #webdev がデフォルトで適用されます。
        </p>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Publishing..." : "Publish Post"}
      </Button>
    </form>
  );
}