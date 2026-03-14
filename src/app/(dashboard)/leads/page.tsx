import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const STATUS_LABEL: Record<string, string> = {
  NEW: "新建",
  CONTACTED: "已联系",
  INVALID: "无效",
  CONVERTED: "已转客户"
};

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const leads = await prisma.lead.findMany({
    where: { ownerId: user.id },
    orderBy: [{ nextFollowAt: "asc" }, { createdAt: "desc" }]
  });

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">线索列表</h1>
        <Link
          href="/leads/new"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          新建线索
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">名称</th>
              <th className="px-3 py-2">联系人/电话</th>
              <th className="px-3 py-2">来源</th>
              <th className="px-3 py-2">状态</th>
              <th className="px-3 py-2">下次跟进</th>
              <th className="px-3 py-2">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b last:border-none">
                <td className="px-3 py-2">
                  <Link
                    href={`/leads/${l.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {l.name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {l.contactName || "-"} / {l.contactPhone || "-"}
                </td>
                <td className="px-3 py-2">{l.source || "-"}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      l.status === "CONVERTED"
                        ? "text-emerald-600"
                        : l.status === "INVALID"
                          ? "text-slate-400"
                          : "text-slate-700"
                    }
                  >
                    {STATUS_LABEL[l.status] ?? l.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {l.nextFollowAt
                    ? l.nextFollowAt.toISOString().slice(0, 10)
                    : "-"}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {l.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  暂无线索数据。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
