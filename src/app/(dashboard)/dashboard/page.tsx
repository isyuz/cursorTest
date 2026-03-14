import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [
    customerCount,
    projectCount,
    wonProjectCount,
    leadCount,
    followUpLeadCount
  ] = await Promise.all([
    prisma.customer.count({ where: { ownerId: user.id } }),
    prisma.project.count({ where: { ownerId: user.id } }),
    prisma.project.count({
      where: { ownerId: user.id, stage: "WON" }
    }),
    prisma.lead.count({
      where: { ownerId: user.id, status: { not: "CONVERTED" } }
    }),
    prisma.lead.count({
      where: {
        ownerId: user.id,
        status: { notIn: ["CONVERTED", "INVALID"] },
        nextFollowAt: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      }
    })
  ]);

  const recentProjects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true, referrer: true }
  });

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">仪表盘</h1>
        <p className="text-sm text-slate-600">欢迎回来，{user.name}</p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs font-medium uppercase text-slate-500">
            我的客户数
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {customerCount}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs font-medium uppercase text-slate-500">
            待跟进线索
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {followUpLeadCount}
          </p>
          <Link
            href="/leads"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            查看线索 →
          </Link>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs font-medium uppercase text-slate-500">
            我的项目数
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {projectCount}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs font-medium uppercase text-slate-500">
            赢单数
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {wonProjectCount}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs font-medium uppercase text-slate-500">
            有效线索数
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {leadCount}
          </p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">近期机会</h2>
          <Link
            href="/projects"
            className="text-sm text-blue-600 hover:underline"
          >
            全部项目 →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">项目</th>
                <th className="px-3 py-2">客户</th>
                <th className="px-3 py-2">介绍人</th>
                <th className="px-3 py-2">金额</th>
                <th className="px-3 py-2">阶段</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((p) => (
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
                  <td className="px-3 py-2 text-xs uppercase text-slate-600">
                    {p.stage}
                  </td>
                </tr>
              ))}
              {recentProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    暂无项目数据。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
