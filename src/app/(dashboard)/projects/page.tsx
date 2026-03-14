import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const STAGE_LABEL: Record<string, string> = {
  LEAD: "线索",
  QUALIFIED: "确认需求",
  PROPOSAL: "方案报价",
  NEGOTIATION: "谈判",
  WON: "赢单",
  LOST: "输单"
};

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { expectedCloseAt: "asc" },
    include: { customer: true, referrer: true }
  });

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">机会/项目</h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          新建项目
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">项目名称</th>
              <th className="px-3 py-2">客户</th>
              <th className="px-3 py-2">介绍人</th>
              <th className="px-3 py-2">金额</th>
              <th className="px-3 py-2">阶段</th>
              <th className="px-3 py-2">预计成交</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b last:border-none">
                <td className="px-3 py-2">
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/customers/${p.customerId}`}
                    className="text-slate-700 hover:underline"
                  >
                    {p.customer.name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {p.referrer ? p.referrer.name : "-"}
                </td>
                <td className="px-3 py-2">
                  ¥{p.amount.toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      p.stage === "WON"
                        ? "text-emerald-600"
                        : p.stage === "LOST"
                          ? "text-slate-400"
                          : "text-slate-700"
                    }
                  >
                    {STAGE_LABEL[p.stage] ?? p.stage}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {p.expectedCloseAt
                    ? p.expectedCloseAt.toISOString().slice(0, 10)
                    : "-"}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  暂无项目数据。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
