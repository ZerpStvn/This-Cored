import { requireProfile } from "@/lib/data";
import { CreatePostForm } from "@/components/forum/create-post-form";

export default async function NewForumPostPage() {
  const { profile } = await requireProfile();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#15171e]">
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-xl font-bold text-white">New post</h1>
        <p className="mb-6 text-sm text-white/50">
          Share something with the This Cored community.
        </p>
        <CreatePostForm profileId={profile.id} />
      </div>
    </div>
  );
}
