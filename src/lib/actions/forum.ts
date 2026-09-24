"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createForumPostAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const attachmentUrl = String(formData.get("attachment_url") ?? "").trim() || null;
  const attachmentType = String(formData.get("attachment_type") ?? "").trim() || null;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      author_id: user.id,
      title,
      content,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType as "image" | "video" | null,
    })
    .select()
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create post." };
  }

  revalidatePath("/forum");
  redirect(`/forum/${data.id}`);
}

export async function createForumCommentAction(
  postId: string,
  parentId: string | null,
  formData: FormData
) {
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return { error: "Comment cannot be empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase.from("forum_comments").insert({
    post_id: postId,
    parent_id: parentId,
    author_id: user.id,
    content,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/forum/${postId}`);
  return { error: null };
}
