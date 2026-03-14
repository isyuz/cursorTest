"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Customer = { id: number; name: string };
type Referrer = { id: number; name: string };

const STAGES = [
  { value: "LEAD", label: "线索" },
  { value: "QUALIFIED", label: "确认需求" },
  { value: "PROPOSAL", label: "方案报价" },
  { value: "NEGOTIATION", label: "谈判" },
  { value: "WON", label: "赢单" },
  { value: "LOST", label: "输单" }
];

type Props = {
  customers: Customer[];
  referrers: Referrer[];
  defaultCustomerId?: number;
};

export function NewProjectForm({
  customers,
  referrers,
  defaultCustomerId
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    customerId:
      defaultCustomerId != null ? String(defaultCustomerId) : "",
    amount: "",
    stage: "LEAD",
    expectedCloseAt: "",
    referrerId: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          customerId: Number(form.customerId),
          amount: Number(form.amount),
          stage: form.stage,
          expectedCloseAt: form.expectedCloseAt || null,
          referrerId: form.referrerId ? Number(form.referrerId) : null
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "创建失败");
      }
      const project = await res.json();
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-white p-6 shadow"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          项目名称
        </label>
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          客户
        </label>
        <select
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.customerId}
          onChange={(e) =>
            setForm((p) => ({ ...p, customerId: e.target.value }))
          }
          required
        >
          <option value="">请选择</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          金额
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          阶段
        </label>
        <select
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.stage}
          onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          预计成交日期
        </label>
        <input
          type="date"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.expectedCloseAt}
          onChange={(e) =>
            setForm((p) => ({ ...p, expectedCloseAt: e.target.value }))
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          介绍人
        </label>
        <select
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.referrerId}
          onChange={(e) =>
            setForm((p) => ({ ...p, referrerId: e.target.value }))
          }
        >
          <option value="">无</option>
          {referrers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
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
          {loading ? "创建中..." : "创建"}
        </button>
      </div>
    </form>
  );
}
