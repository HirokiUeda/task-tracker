'use client';

import { useState, useEffect } from 'react';

// タスクの型定義
type Task = {id: number; name: string; goalDays: number;};

export default function TaskList() {
    // タスクの状態を管理するためのuseStateフック
    const [tasks, setTasks] = useState<Task[]>([]);

    // loading状態を管理するためのuseStateフック
    const [loading, setLoading] = useState(false);

    // エラー状態を管理するためのuseStateフック
    const [error, setError] = useState<null | string>(null);

    // 新しいタスクの入力状態を管理するためのuseStateフック
    const [showInput, setShowInput] = useState(false);

    // 新しいタスクの内容を管理するためのuseStateフック
    const [newTask, setNewTask] = useState('');

    // 完了データを管理するためのuseStateフック
    const [doneToday, setDoneToday] = useState<Record<number, boolean>>({});

    // todayStrは今日の日付をYYYY-MM-DD形式で取得
    const todayStr = new Date().toISOString().slice(0, 10); // "2025-05-06"

    // completedCountは完了したタスクの数をカウント
    const completedCount = tasks.filter(t => doneToday[t.id]).length;
    // percentは完了したタスクの割合を計算
    const percent = (completedCount / tasks.length) * 100;

    // タスクを取得するためのuseEffectフック
    // コンポーネントがマウントされたときに実行される
    useEffect(() => {
        // 即時関数を使って非同期処理を実行
        (async () => {
          try {
            // APIからタスクを取得
            const res = await fetch('/api/tasks');   // 同一ドメインなので相対 URL
            // レスポンスが正常でない場合はエラーを投げる
            if (!res.ok) throw new Error('Fetch failed');
            // レスポンスをJSON形式でtasksステートにセット
            const list: Task[] = await res.json();
            setTasks(list);

            // 完了状態を並列取得
            const status = await Promise.all(
                list.map(async (task) => {
                  const r = await fetch(
                    // タスクの完了状態を取得するAPIを呼び出す
                    `/api/tasks/${task.id}/completions?from=${todayStr}&to=${todayStr}`
                  );

                  if (!r.ok) return [task.id, false] as const;
                  const dates: string[] = await r.json(); // ["2025-05-06"] or []
                  return [task.id, dates.length > 0] as const;
                })
            );

            // 返って来たタプル配列 → オブジェクトへ
            setDoneToday(Object.fromEntries(status));

          } catch (e) {
            // エラーが発生した場合はerrorステートにセット
            setError((e as Error).message);
          } finally {
            // ローディング状態をfalseにする
            setLoading(false);
          }
        })();
    }, []);

    // タスクを追加するための関数
    // 新しいタスクが入力されたときに呼び出される
    async function handleAddTask() {

        // 簡易バリデーション
        if (!newTask.trim() || newTask.length > 30) {
            alert('タスク名は1文字以上30文字以下で入力してください'); 
            return;
        }

        try {
            // APIにPOSTリクエストを送信して新しいタスクを追加
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTask.trim(), goalDays: 30 })
            });
            // レスポンスが正常でない場合はエラーを投げる
            if (!res.ok) throw new Error('Add failed');

            // レスポンスをJSON形式で取得し、追加されたタスクを受け取る
            const created: Task = await res.json();

            // prevはReactが渡してくれる今の最新state
            // それを元に新しいstateを作る
            setTasks((prev) => [...prev, created]);

            // 入力欄をクリア
            setNewTask('');
            setShowInput(false);
        } catch (e) {
            alert('登録に失敗しました');
            console.error(e);
        }
    }

    // タスクの完了状態を更新するための関数
    async function toggleComplete(id: number, checked: boolean) {
        // 今日の日付を取得してYYYY-MM-DD形式に変換
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      
        try {
            // APIにPUTリクエストを送信して完了状態を更新
            await fetch(`/api/tasks/${id}/completions/${today}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checked })
            });
            
            setDoneToday((prev) => ({ ...prev, [id]: checked }));
        } catch (e) {
          alert('完了登録に失敗しました');
          console.error(e);
        }
      }
      
    
    if (loading) return <p>Loading...</p>;
    if (error)   return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow w-[300px]">
            <h2 className="text-xl font-bold mb-4">タスク一覧</h2>

            <ul className="space-y-2 mb-4">
                {/* タスクの一覧を表示 */}
                {tasks.map((task, idx) => (
                <li key={idx} className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        // 完了状態を管理するためのチェックボックス
                        checked={!!doneToday[task.id]}
                        onChange={(e) => toggleComplete(task.id, e.target.checked)}
                    />
                    <span>{task.name}</span>
                </li>
                ))}

                {/* showInputがtrueのときだけ新しいタスクの入力欄を表示 */}
                {showInput && (
                <li className="flex items-center gap-2">
                    <input
                        type="text"
                        className="border px-2 py-1 rounded w-full"
                        placeholder="新しいタスクを入力"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        // Enterキーが押されたときにhandleAddTaskを呼び出す
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        autoFocus
                    />
                </li>
                )}
            </ul>

            <div className="flex justify-end">
                <button
                className="w-8 h-8 rounded-full bg-blue-500 text-white text-xl flex items-center justify-center"
                // タスク追加ボタンがクリックされたときにhandleAddTaskを呼び出す
                onClick={() => setShowInput(true)}
                >
                ＋
                </button>
            </div>

            {/* 進捗バー */}
            <div className="w-full bg-gray-200 h-2 rounded">
                <div className="bg-blue-500 h-2 rounded" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-xs">{completedCount} / {tasks.length}</p>
        </div>
    );
}
