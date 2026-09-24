"use client";

import { useState, useTransition } from "react";
import { joinServerByInviteAction } from "@/lib/actions/servers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JoinServerForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        const code = String(formData.get("code") ?? "");
        startTransition(async () => {
          const result = await joinServerByInviteAction(code);
          if (result?.error) setError(result.error);
        });
      }}
      className="flex w-full flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Invite code</Label>
        <Input id="code" name="code" placeholder="e.g. 4f9a1c2b0e3d" required />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-indigo-500 text-white hover:bg-indigo-400"
      >
        {isPending ? "Joining..." : "Join server"}
      </Button>
    </form>
  );
}
