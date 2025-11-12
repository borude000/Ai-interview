import { db } from "./db";
import { and, asc, desc, eq, gt, isNull, or, ilike } from "drizzle-orm";
import { users, categories, questions, interviews, interview_messages, type Question, type Interview } from "@shared/schema";
import type { InsertUser as SharedInsertUser, User as SharedUser } from "@shared/schema";

export type User = SharedUser;
export type InsertUser = Omit<SharedInsertUser, 'id' | 'created_at' | 'updated_at'>;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Q&A storage
  getQuestionById(id: string): Promise<Question | undefined>;
  getNextQuestion(filter: {
    categoryKey: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    role?: string | null;
    techs?: string[];
    afterId?: string | null;
  }): Promise<Question | undefined>;
  // Interviews persistence
  createInterview(data: { userId: string; type: 'hr'|'technical'; role?: string; techs?: string[]; difficulty: 'beginner'|'intermediate'|'advanced' }): Promise<Interview>;
  addMessage(data: { interviewId: string; sender: 'user'|'ai'; text: string }): Promise<void>;
  finishInterview(data: { interviewId: string; score: number; summary: string }): Promise<void>;
  listInterviewsByUser(userId: string): Promise<Array<{ id: string; type: string; role: string | null; techs: string | null; difficulty: string; started_at: Date; ended_at: Date | null; score: number | null }>>;
  getInterviewWithMessages(interviewId: string, userId: string): Promise<{ interview: Interview | null; messages: Array<{ sender: 'user'|'ai'; text: string; created_at: Date }> }>;
  // Practice questions
  listQuestions(filter: { categoryKey: string; difficulty?: 'beginner'|'intermediate'|'advanced'; role?: string | null; techs?: string[]; limit?: number }): Promise<Question[]>;
}

export class DbStorage {
  async init() {
    // Tables are created via migrations
    // Check if we need to run any migrations here if not using a migration runner
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      role: 'user' as const
    };
    
    const result = await db
      .insert(users)
      .values(newUser)
      .returning();
    
    return result[0];
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const rows = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
    return rows[0] as Question | undefined;
  }

  private buildTechsPredicate(techs?: string[]) {
    if (!techs || techs.length === 0) return undefined;
    // questions.techs is a comma-separated list; simple OR ILIKE matching
    const likes = techs.map((t) => ilike(questions.techs, `%${t}%`));
    // include rows with null/empty techs as generic
    return or(isNull(questions.techs), ...likes);
  }

  async getNextQuestion(params: {
    categoryKey: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    role?: string | null;
    techs?: string[];
    afterId?: string | null;
  }): Promise<Question | undefined> {
    const { categoryKey, difficulty, role, techs, afterId } = params;

    const conds = [
      eq(questions.category_key, categoryKey),
      eq(questions.difficulty, difficulty),
    ] as any[];
    if (role) conds.push(or(eq(questions.role, role), isNull(questions.role)));
    const techPred = this.buildTechsPredicate(techs);
    if (techPred) conds.push(techPred);
    const baseWhere = and(...conds);

    // If afterId provided, fetch the question to compute ordering fallback
    if (afterId) {
      const prev = await db.select().from(questions).where(eq(questions.id, afterId)).limit(1);
      const prevQ = prev[0];
      if (prevQ) {
        // Try to get next by greater order_no then id
        const nextList = await db
          .select()
          .from(questions)
          .where(and(
            baseWhere,
            or(
              gt(questions.order_no, prevQ.order_no ?? 0),
              and(eq(questions.order_no, prevQ.order_no ?? 0), gt(questions.id, afterId))
            )
          ))
          .orderBy(asc(questions.order_no), asc(questions.id))
          .limit(1);
        if (nextList[0]) return nextList[0] as Question;
      }
    }

    // Otherwise return the first matching
    const firstList = await db
      .select()
      .from(questions)
      .where(baseWhere)
      .orderBy(asc(questions.order_no), asc(questions.id))
      .limit(1);
    return firstList[0] as Question | undefined;
  }

  // Interviews
  async createInterview(data: { userId: string; type: 'hr'|'technical'; role?: string; techs?: string[]; difficulty: 'beginner'|'intermediate'|'advanced' }): Promise<Interview> {
    const result = await db.insert(interviews).values({
      user_id: data.userId,
      type: data.type,
      role: data.role ?? null,
      techs: data.techs && data.techs.length ? data.techs.join(',') : null,
      difficulty: data.difficulty,
    }).returning();
    return result[0] as Interview;
  }

  async addMessage(data: { interviewId: string; sender: 'user'|'ai'; text: string }): Promise<void> {
    await db.insert(interview_messages).values({
      interview_id: data.interviewId,
      sender: data.sender,
      text: data.text,
    });
  }

  async finishInterview(data: { interviewId: string; score: number; summary: string }): Promise<void> {
    await db.update(interviews).set({
      ended_at: new Date(),
      score: data.score,
      summary: data.summary,
    }).where(eq(interviews.id, data.interviewId));
  }

  async listInterviewsByUser(userId: string) {
    const rows = await db.select({
      id: interviews.id,
      type: interviews.type,
      role: interviews.role,
      techs: interviews.techs,
      difficulty: interviews.difficulty,
      started_at: interviews.started_at,
      ended_at: interviews.ended_at,
      score: interviews.score,
    }).from(interviews).where(eq(interviews.user_id, userId)).orderBy(desc(interviews.started_at));
    return rows as any;
  }

  async getInterviewWithMessages(interviewId: string, userId: string) {
    const rows = await db.select().from(interviews).where(and(eq(interviews.id, interviewId), eq(interviews.user_id, userId))).limit(1);
    const interview = rows[0] as Interview | undefined;
    if (!interview) return { interview: null, messages: [] };
    const msgs = await db.select({ sender: interview_messages.sender, text: interview_messages.text, created_at: interview_messages.created_at }).from(interview_messages).where(eq(interview_messages.interview_id, interviewId)).orderBy(asc(interview_messages.created_at));
    return { interview, messages: msgs as any };
  }

  async listQuestions(filter: { categoryKey: string; difficulty?: 'beginner'|'intermediate'|'advanced'; role?: string | null; techs?: string[]; limit?: number }): Promise<Question[]> {
    const conds = [eq(questions.category_key, filter.categoryKey)] as any[];
    if (filter.difficulty) conds.push(eq(questions.difficulty, filter.difficulty));
    if (filter.role) conds.push(or(eq(questions.role, filter.role), isNull(questions.role)));
    const techPred = this.buildTechsPredicate(filter.techs);
    if (techPred) conds.push(techPred);
    const rows = await db.select().from(questions).where(and(...conds)).orderBy(asc(questions.order_no), asc(questions.id)).limit(filter.limit ?? 50);
    return rows as any;
  }
}

export const dbStorage = new DbStorage();

// Initialize the database when this module is loaded
dbStorage.init().catch(console.error);
