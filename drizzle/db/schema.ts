import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  unique,
  json,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  emailVerified: timestamp("email_verified"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    uniqueProviderAccount: unique("accounts_provider_account").on(
      account.provider,
      account.providerAccountId
    ),
  })
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    uniqueIdentifierToken: unique("verification_tokens_identifier_token").on(
      verificationToken.identifier,
      verificationToken.token
    ),
  })
);

export const authenticators = pgTable(
  "authenticators",
  {
    id: text("id").primaryKey(),
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    uniqueUserCredential: unique("authenticators_user_credential").on(
      authenticator.userId,
      authenticator.credentialID
    ),
  })
);

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  aiEnabled: boolean("ai_enabled").notNull().default(true),
  autoBackup: boolean("auto_backup").notNull().default(true),
  theme: text("theme").notNull().default("light"),
  privacyMode: text("privacy_mode").notNull().default("private"),
  notifications: json("notifications").notNull().default("{}"),
});

export const memories = pgTable("memories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  date: timestamp("date").notNull(),
  location: text("location"),
  mood: text("mood"),
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  syncStatus: text("sync_status").notNull().default("synced"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const memoryMedia = pgTable("memory_media", {
  id: text("id").primaryKey(),
  memoryId: text("memory_id")
    .notNull()
    .references(() => memories.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: text("type").notNull(),
  filename: text("filename").notNull(),
  size: integer("size"),
  metadata: json("metadata"),
});

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3B82F6"),
  count: integer("count").notNull().default(0),
});

export const memoryTags = pgTable("memory_tags", {
  id: text("id").primaryKey(),
  memoryId: text("memory_id")
    .notNull()
    .references(() => memories.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const familyMembers = pgTable("family_members", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  memberId: text("member_id").references(() => users.id),
  email: text("email").unique().notNull(),
  name: text("name"),
  relationship: text("relationship").notNull(),
  status: text("status").notNull().default("pending"),
  permissions: json("permissions")
    .notNull()
    .default('{"canView": true, "canComment": false, "canShare": false}'),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  joinedAt: timestamp("joined_at"),
});

export const memoryShares = pgTable("memory_shares", {
  id: text("id").primaryKey(),
  memoryId: text("memory_id")
    .notNull()
    .references(() => memories.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sharedBy: text("shared_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  canEdit: boolean("can_edit").notNull().default(false),
  sharedAt: timestamp("shared_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  memoryId: text("memory_id")
    .notNull()
    .references(() => memories.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: text("id").primaryKey(),
  memoryId: text("memory_id")
    .notNull()
    .references(() => memories.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stories = pgTable("stories", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  dateRange: json("date_range").notNull(),
  tone: text("tone").notNull(),
  length: text("length").notNull(),
  status: text("status").notNull().default("generating"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiJobs = pgTable("ai_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  memoryId: text("memory_id").references(() => memories.id),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  input: json("input"),
  output: json("output"),
  error: text("error"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const userAnalytics = pgTable("user_analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  totalMemories: integer("total_memories").notNull().default(0),
  memoriesThisMonth: integer("memories_this_month").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  topMoods: json("top_moods").notNull().default("[]"),
  topTags: json("top_tags").notNull().default("[]"),
  monthlyActivity: json("monthly_activity").notNull().default("[]"),
  weeklyPattern: json("weekly_pattern").notNull().default("[]"),
  lastCalculated: timestamp("last_calculated").notNull().defaultNow(),
});

export const systemLogs = pgTable("system_logs", {
  id: text("id").primaryKey(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  metadata: json("metadata"),
  userId: text("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const backupJobs = pgTable("backup_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  fileUrl: text("file_url"),
  size: integer("size"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const exportJobs = pgTable("export_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  format: text("format").notNull(),
  dateRange: json("date_range"),
  status: text("status").notNull().default("pending"),
  fileUrl: text("file_url"),
  size: integer("size"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});
