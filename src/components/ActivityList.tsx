"use client";

type Activity = {
  id: number;
  type: string;
  typeLabel: string;
  content: string;
  userName: string;
  createdAt: string;
};

export function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-500">暂无跟进记录</p>;
  }

  return (
    <ul className="space-y-3">
      {activities.map((a) => (
        <li
          key={a.id}
          className="border-l-2 border-slate-200 pl-3 py-1 text-sm"
        >
          <span className="font-medium text-slate-600">{a.typeLabel}</span>
          <span className="text-slate-400 ml-2 text-xs">{a.userName}</span>
          <span className="text-slate-400 ml-2 text-xs">
            {new Date(a.createdAt).toLocaleString("zh-CN")}
          </span>
          <p className="mt-1 text-slate-800">{a.content}</p>
        </li>
      ))}
    </ul>
  );
}
