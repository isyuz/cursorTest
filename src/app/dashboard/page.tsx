import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [customerCount, projectCount, wonProjectCount] = await Promise.all([
    prisma.customer.count({ where: { ownerId: user.id } }),
    prisma.project.count({ where: { ownerId: user.id } }),
    prisma.project.count({
      where: { ownerId: user.id, stage: "WON" }
    })
  ]);

  const recentProjects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true, referrer: true }
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              仪表盘
            </h1>
            <p className="text-sm text-slate-600">
              欢迎回来，{user.name}
            </p>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
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
              我的项目数
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {projectCount}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-xs font-medium uppercase text-slate-500">
              赢单项目数
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {wonProjectCount}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            最近项目
          </h2>
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
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.customer.name}</td>
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
    </main>
  );
}

