export const dynamicParams = true;   // ★必須
export const runtime = 'nodejs';     // Turbopack でも安定（任意）

// レスポンスを生成するユーティリティをインポート
import { NextResponse } from 'next/server';
// Prisma ORMのインスタンスをインポート
import { prisma } from '@/lib/prisma';
// zodを使った日付けパラメータ用バリデーションスキーマをインポート
import { dateParam } from '@/lib/validators';
// 追加バリデーション用
import { z } from 'zod';

export async function GET(_req: Request, { params }: { params: Promise<{ taskId: string }>}) {
    // タスクIDを取得
    const taskId = (await params).taskId;

    // /api/tasks/1/completions?from=2025-04-01&to=2025-04-30 のような日付範囲を取得
    // 1. URL オブジェクトを生成
    const { searchParams } = new URL(_req.url);
    const from = searchParams.get('from') ?? undefined;
    const to   = searchParams.get('to') ?? undefined;

    // fromとtoが指定されている場合、zodを使ってバリデーションを実行
    const range = z.object({ from: dateParam.optional(), to: dateParam.optional() }).safeParse({ from, to });

    // 不正な日付けが指定されている場合、400エラーを返す
    if (!range.success)
        return NextResponse.json(range.error.format(), { status: 400 });

    // Prismaを使ってCompletionテーブルを検索
    const completions = await prisma.completion.findMany({
        // CompletionテーブルのtaskIdが指定されたタスクIDと一致するものを検索
        // from / toが指定されている場合、日付けの範囲でフィルタリング
        where: {
        taskId: Number(taskId),
        ...(from && { date: { gte: new Date(from) } }),
        ...(to && { date: { lte: new Date(to) } }),
        },
        // Completionテーブルのdateを取得
        select: { date: true },
    });

    // 取得したCompletionのdateをISO形式の文字列に変換して返す
    return NextResponse.json(
        completions.map((c) => c.date.toISOString().slice(0, 10))
    );
}
