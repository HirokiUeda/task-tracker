export const dynamicParams = true;   // ★必須
export const runtime = 'nodejs';     // Turbopack でも安定（任意）

// Next.jsのレスポンスを返すAPI
import { NextRequest,NextResponse } from 'next/server';
// Prisma ORMのインスタンスをインポート
import { prisma } from '@/lib/prisma';
// zodを使った日付けパラメータ用バリデーションスキーマをインポート
import { dateParam } from '@/lib/validators'; 

export async function PUT(req: NextRequest, context : { params: { taskId: string; date: string } }) {
    // タスクIDと日付けを取得
    const { taskId, date } = context.params;

    // リクエストボディをJSON形式で取得
    const { checked } = await req.json();        // { checked: true/false }
    // booleanでない場合、400エラーを返す
    if (typeof checked !== 'boolean')
        return NextResponse.json({ msg: 'checked must be boolean' }, { status: 400 });

    // 日付けのバリデーションを実行
    if (!dateParam.safeParse(date).success)
        return NextResponse.json({ msg: 'invalid date' }, { status: 400 });

    // DateをISO形式の文字列に変換
    const isoDate = new Date(date);

    // ☑をつける場合、upsertで追加、☑を外す場合、deleteManyで削除
    if (checked) {
        await prisma.completion.upsert({
        where: { taskId_date: { taskId: Number(taskId), date: isoDate } },
        update: {},
        create: { taskId: Number(taskId), date: isoDate },
        });
    } else {
        await prisma.completion.deleteMany({
        where: { taskId: Number(taskId), date: isoDate },
        });
    }
    return NextResponse.json({ ok: true });
}
