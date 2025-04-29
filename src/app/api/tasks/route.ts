// レスポンスを生成するユーティリティをインポート
import { NextResponse } from 'next/server'; 
// Prisma ORMのインスタンスをインポート
import { prisma } from '@/lib/prisma';
// zodを使ったタスク追加用バリデーションスキーマをインポート
import { taskSchema } from '@/lib/validators'; 

/** GET /tasks – 全タスク一覧 */
export async function GET() {

    // Prismaを使って全タスクを取得
    const tasks = await prisma.task.findMany({
        // タスクの取得時に関連するcompletionsのカウントを取得
        include: { _count: { select: { completions: true } } },
        // タスクの取得順序を作成日時の昇順に設定
        orderBy: { createdAt: 'asc' },
    });

    // レスポンスをJSON形式で返す(Content-Typeとステータス200が自動でつく)
    return NextResponse.json(tasks);
}

/** POST /tasks – タスク追加 */
export async function POST(req: Request) {

    // リクエストボディをJSON形式で取得
    const body = await req.json();

    // バリデーション（nameとgoalDays）を実行し、エラーがあれば400エラーを返す
    const parsed = taskSchema.safeParse(body);
    // バリデーションが失敗した場合、エラーメッセージを400エラーとして返す
    if (!parsed.success) {
        return NextResponse.json(parsed.error.format(), { status: 400 });
    }

    // name,goalDaysを取得し、Prismaを使って新しいタスクを作成
    const task = await prisma.task.create({ data: parsed.data });
    
    // 作成したタスクをJSON形式で返す Content-Typeとステータス201が自動でつく)
    return NextResponse.json(task, { status: 201 });
}
