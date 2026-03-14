"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STAGES = [
  { value: "LEAD", label: "线索" },
  { value: "QUALIFIED", label: "确认需求" },
  { value: "PROPOSAL", label: "方案报价" },
  { value: "NEGOTIATION", label: "谈判" },
  { value: "WON", label: "赢单" },
  { value: "LOST", label: "输单" }
];

export function ProjectStageForm({
  projectId,
  currentStage,
  stageLabel
}: {
  projectId: number;
  currentStage: string;
  stageLabel: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [stage, setStage] = useState(currentStage);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage })
      });
      if (!res.ok) throw new Error("更新失败");
      setEditing(false);
      router.refresh();
    } catch {
      alert("更新失败");
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="text-sm text-blue-600 hover:underline disabled:opacity-70"
        >
          {loading ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setStage(currentStage); }}
          className="text-sm text-slate-500 hover:underline"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <span>
      {stageLabel}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="ml-2 text-xs text-slate-500 hover:text-slate-700"
      >
        修改
      </button>
    </span>
  );
}
