export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type ServerRole = "owner" | "admin" | "member";

export type Server = {
  id: string;
  name: string;
  image_url: string | null;
  invite_code: string;
  owner_id: string;
  created_at: string;
};

export type ServerMember = {
  id: string;
  server_id: string;
  profile_id: string;
  role: ServerRole;
  created_at: string;
};

export type ChannelType = "text" | "voice";

export type Channel = {
  id: string;
  server_id: string;
  name: string;
  type: ChannelType;
  created_at: string;
};

export type AttachmentType = "image" | "video";

export type Message = {
  id: string;
  channel_id: string;
  profile_id: string;
  content: string;
  attachment_url: string | null;
  attachment_type: AttachmentType | null;
  created_at: string;
  updated_at: string;
};

export type MessageWithProfile = Message & {
  profile: Profile;
};

export type ForumPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  attachment_url: string | null;
  attachment_type: AttachmentType | null;
  created_at: string;
  updated_at: string;
};

export type ForumPostWithMeta = ForumPost & {
  profile: Profile;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

export type ForumComment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  content: string;
  created_at: string;
};

export type ForumCommentWithProfile = ForumComment & {
  profile: Profile;
};

export type ForumCommentNode = ForumCommentWithProfile & {
  children: ForumCommentNode[];
};

export type ForumPostLike = {
  post_id: string;
  profile_id: string;
  created_at: string;
};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
        Relationships: Relationship[];
      };
      servers: {
        Row: Server;
        Insert: Partial<Server> & { name: string; owner_id: string };
        Update: Partial<Server>;
        Relationships: Relationship[];
      };
      server_members: {
        Row: ServerMember;
        Insert: Partial<ServerMember> & { server_id: string; profile_id: string };
        Update: Partial<ServerMember>;
        Relationships: [
          {
            foreignKeyName: "server_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      channels: {
        Row: Channel;
        Insert: Partial<Channel> & { server_id: string; name: string };
        Update: Partial<Channel>;
        Relationships: Relationship[];
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & {
          channel_id: string;
          profile_id: string;
          content: string;
        };
        Update: Partial<Message>;
        Relationships: [
          {
            foreignKeyName: "messages_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_posts: {
        Row: ForumPost;
        Insert: Partial<ForumPost> & {
          author_id: string;
          title: string;
          content: string;
        };
        Update: Partial<ForumPost>;
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_comments: {
        Row: ForumComment;
        Insert: Partial<ForumComment> & {
          post_id: string;
          author_id: string;
          content: string;
        };
        Update: Partial<ForumComment>;
        Relationships: [
          {
            foreignKeyName: "forum_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_post_likes: {
        Row: ForumPostLike;
        Insert: Partial<ForumPostLike> & { post_id: string; profile_id: string };
        Update: Partial<ForumPostLike>;
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_server: {
        Args: { _name: string; _image_url?: string | null };
        Returns: Server;
      };
      join_server_by_invite: {
        Args: { _invite_code: string };
        Returns: Server;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
