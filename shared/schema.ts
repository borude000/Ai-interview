import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  // Use UUID type to match DB migration (id UUID PRIMARY KEY DEFAULT uuid_generate_v4())
  // We omit a TS-side default so the DB default runs.
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  full_name: text("full_name"),
  role: text("role").notNull().default('user'),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email().optional(),
  full_name: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user')
}).pick({
  username: true,
  password: true,
  email: true,
  full_name: true,
  role: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories for interview questions (e.g., hr, technical)
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories, {
  key: z.string().min(1),
  name: z.string().min(1),
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Questions table, filtered by category, difficulty, optional role and techs
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey(),
  category_key: text("category_key").notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  difficulty: text("difficulty").notNull(), // 'beginner' | 'intermediate' | 'advanced'
  role: text("role"),
  techs: text("techs"), // comma-separated ids
  order_no: integer("order_no").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  keywords: text("keywords"), // comma-separated keywords for validation
});

export const insertQuestionSchema = createInsertSchema(questions, {
  category_key: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().optional(),
  difficulty: z.enum(["beginner","intermediate","advanced"]),
  role: z.string().optional(),
  order_no: z.number().int().min(0).optional(),
  keywords: z.string().optional(),
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Interviews persistence
export const interviews = pgTable("interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id").notNull(),
  type: text("type").notNull(), // 'hr' | 'technical'
  role: text("role"),
  techs: text("techs"), // comma-separated
  difficulty: text("difficulty").notNull(),
  started_at: timestamp("started_at").defaultNow().notNull(),
  ended_at: timestamp("ended_at"),
  score: integer("score"),
  summary: text("summary"),
});

export const insertInterviewSchema = createInsertSchema(interviews, {
  user_id: z.string().uuid(),
  type: z.enum(["hr","technical"]),
  role: z.string().optional(),
  techs: z.string().optional(),
  difficulty: z.enum(["beginner","intermediate","advanced"]),
  started_at: z.date().optional(),
  ended_at: z.date().optional(),
  score: z.number().int().optional(),
  summary: z.string().optional(),
});
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

export const interview_messages = pgTable("interview_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  interview_id: uuid("interview_id").notNull(),
  sender: text("sender").notNull(), // 'user' | 'ai'
  text: text("text").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertInterviewMessageSchema = createInsertSchema(interview_messages, {
  interview_id: z.string().uuid(),
  sender: z.enum(["user","ai"]),
  text: z.string().min(1),
});
export type InsertInterviewMessage = z.infer<typeof insertInterviewMessageSchema>;
export type InterviewMessage = typeof interview_messages.$inferSelect;
