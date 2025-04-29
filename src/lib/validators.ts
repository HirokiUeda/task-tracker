// src/lib/validators.ts
import { z } from 'zod';

// タスク追加用の入力スキーマ
export const taskSchema = z.object({
  name: z.string().min(1).max(50),  // タスク名は1文字以上50文字以下
  goalDays: z.number().int().positive().default(30),    // 目標日数は正の整数、デフォルトは30
});

// 日付けパラメータ用のスキーマ
export const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/);              // yyyy-mm-dd
