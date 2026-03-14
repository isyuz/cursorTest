"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIVITY_TYPES = [
  { value: "CALL", label: "电话" },
  { value: "WECHAT", label: "微信" },
  { value: "EMAIL", label: "邮件" },
  { value: "MEETING", label: "面谈" },
  { value: "OTHER", label: "其他" }
];

type Props = {
  customerId?: number;
  leadId?: number;
  onAdded?: () => void;
};

export default function AddActivityForm({
  customerId,
  leadId,
  onAdded
}: Props) {
  const router = useRouter();
  const [type, setType] = useState("CALL");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId && !leadId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, customerId, leadId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "添加失败");
      }
      setContent("");
      onAdded?.();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "添加失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-0.5 block text-xs font-medium text-slate-600">
            方式
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded border border-slate-200 px-2 py-1.5 text-sm"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-0.5 block text-xs font-medium text-slate-600">
            内容
          </label>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="跟进内容..."
            className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? "提交中..." : "添加"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
