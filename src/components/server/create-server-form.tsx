"use client";

import { useState, useTransition } from "react";
import { createServerAction } from "@/lib/actions/servers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateServerForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createServerAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="flex w-full flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Server name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. This Cored Lounge"
          required
          maxLength={64}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-indigo-500 text-white hover:bg-indigo-400"
      >
        {isPending ? "Creating..." : "Create server"}
      </Button>
    </form>
  );
}
