'use client';

import TaskList from "./components/tasklist";
import Calendar from "./components/calendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center p-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <TaskList />
        <Calendar />
      </div>
    </main>
  );
}
