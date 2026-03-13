"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Referrer } from "@prisma/client";

type Props = {
  referrers: Referrer[];
  customerId?: number;
  initialData?: {
    name: string;
    contactName?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    industry?: string | null;
    size?: string | null;
    tags?: string | null;
    referrerId?: number | null;
  };
};

export default function CustomerForm({ referrers, customerId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    contactName: initialData?.contactName ?? "",
    contactPhone: initialData?.contactPhone ?? "",
    contactEmail: initialData?.contactEmail ?? "",
    industry: initialData?.industry ?? "",
    size: initialData?.size ?? "",
    tags: initialData?.tags ?? "",
    referrerId: initialData?.referrerId ? String(initialData.referrerId) : ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...form,
        referrerId: form.referrerId ? Number(form.referrerId) : null
      };

      const url = customerId ? `/api/customers/${customerId}` : "/api/customers";
      const method = customerId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "保存失败");
      }

      router.push("/customers");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "保存失败");
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
            客户名称
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            联系人
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.contactName}
            onChange={(e) => updateField("contactName", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            联系电话
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            邮箱
          </label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            行业
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.industry}
            onChange={(e) => updateField("industry", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            规模
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.size}
            onChange={(e) => updateField("size", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            标签（用逗号分隔）
          </label>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.tags}
            onChange={(e) => updateField("tags", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            介绍人
          </label>
          <select
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.referrerId}
            onChange={(e) => updateField("referrerId", e.target.value)}
          >
            <option value="">无</option>
            {referrers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}

