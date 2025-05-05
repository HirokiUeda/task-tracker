export default function Calendar() {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-[300px]">
        <h2 className="text-lg font-bold mb-4">April 2025</h2>
        <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-700">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d} className="font-bold">{d}</div>
          ))}
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            const isChecked = [1, 3, 4, 7, 11, 28].includes(day); // ダミー完了日
            const isToday = day === 28; // 今日（選択日）
  
            return (
              <div
                key={day}
                className={`rounded-full w-6 h-6 flex items-center justify-center
                  ${isToday ? "bg-blue-500 text-white" : isChecked ? "text-blue-600" : ""}`}
              >
                {isChecked ? "✓" : day}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  