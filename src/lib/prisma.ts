// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// グローバル名前空間に型を追加するための型定義
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// PrismaClientのインスタンスを1つ作成、すでに作られていればそれを使用
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['error'],
  });

// 開発モードだけグローバルにインスタンスを保存
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
