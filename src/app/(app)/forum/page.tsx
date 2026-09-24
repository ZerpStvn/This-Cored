import Link from "next/link";
import { Plus } from "lucide-react";
import { requireProfile, getForumPosts } from "@/lib/data";
import { PostCard } from "@/components/forum/post-card";
import { Button } from "@/components/ui/button";

export default async function ForumPage() {
  const { profile, supabase } = await requireProfile();
  const posts = await getForumPosts(supabase, profile.id);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#15171e]">
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Community Forum</h1>
            <p className="text-sm text-white/50">
              Post, start threads, and share with This Cored.
            </p>
          </div>
          <Button asChild className="bg-indigo-500 text-white hover:bg-indigo-400">
            <Link href="/forum/new">
              <Plus className="size-4" />
              New post
            </Link>
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-sm text-white/50">No posts yet.</p>
            <Link href="/forum/new" className="text-sm text-indigo-400 hover:underline">
              Be the first to post
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentProfileId={profile.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
