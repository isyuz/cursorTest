"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "NEW", label: "新建" },
  { value: "CONTACTED", label: "已联系" },
  { value: "INVALID", label: "无效" },
  { value: "CONVERTED", label: "已转客户" }
];

type Props = {
  leadId?: number;
  initialData?: {
    name: string;
    contactName?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    source?: string | null;
    status?: string;
    nextFollowAt?: string | null;
    remark?: string | null;
  };
};

export default function LeadForm({ leadId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    contactName: initialData?.contactName ?? "",
    contactPhone: initialData?.contactPhone ?? "",
    contactEmail: initialData?.contactEmail ?? "",
    source: initialData?.source ?? "",
    status: initialData?.status ?? "NEW",
    nextFollowAt: initialData?.nextFollowAt
      ? initialData.nextFollowAt.slice(0, 16)
      : "",
    remark: initialData?.remark ?? ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        nextFollowAt: form.nextFollowAt ? new Date(form.nextFollowAt).toISOString() : null
      };
      const url = leadId ? `/api/leads/${leadId}` : "/api/leads";
      const res = await fetch(url, {
        method: leadId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "保存失败");
      }
      router.push(leadId ? `/leads/${leadId}` : "/leads");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-white p-6 shadow"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            名称（公司/联系人）
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            联系人
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            电话
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            邮箱
          </label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.contactEmail}
            onChange={(e) => update("contactEmail", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            来源渠道
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
            placeholder="如：官网、展会"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            状态
          </label>
          <select
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            下次跟进时间
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.nextFollowAt}
            onChange={(e) => update("nextFollowAt", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            备注
          </label>
          <textarea
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            rows={2}
            value={form.remark}
            onChange={(e) => update("remark", e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => router.back()}
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
