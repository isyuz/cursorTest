"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConvertLeadButton({ leadId }: { leadId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
    if (!confirm("确定将该线索转为客户？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method: "POST"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "转换失败");
      }
      const customer = await res.json();
      router.push(`/customers/${customer.id}`);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "转换失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConvert}
      disabled={loading}
      className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
    >
      {loading ? "转换中..." : "转为客户"}
    </button>
  );
}
