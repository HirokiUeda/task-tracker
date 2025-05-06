import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// YYYY-MM-DD で 0時を返すユーティリティ
const day = (d: Date) => new Date(d.toISOString().slice(0, 10));

export async function GET(_req: Request, { params }: { params: Promise<{ taskId: string } >}
) {
    // タスクIDを取得
    const id = (await params).taskId;

    // 今日を含め過去 30+ α 日ぶん取る（多めに30～40で十分）
    const dates = await prisma.completion.findMany({
        where: { taskId: Number(id), date: { lte: new Date() } },
        orderBy: { date: 'desc' },
        select: { date: true },
        take: 40
    });

    let streak = 0;
    const cursor = day(new Date()); // 今日

    for (const { date } of dates) {
        if (day(date).getTime() === cursor.getTime()) {
        streak += 1;
        // 前⽇へ 1 ⽇ずらす
        cursor.setDate(cursor.getDate() - 1);
        } else {
        break; // 連続が途切れた
        }
    }

    return NextResponse.json({ streak });
}
