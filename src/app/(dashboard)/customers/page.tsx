import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const customers = await prisma.customer.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { referrer: true }
  });

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">客户列表</h1>
        <Link
          href="/customers/new"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          新建客户
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">名称</th>
              <th className="px-3 py-2">联系人</th>
              <th className="px-3 py-2">电话</th>
              <th className="px-3 py-2">介绍人</th>
              <th className="px-3 py-2">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b last:border-none">
                <td className="px-3 py-2">
                  <Link
                    href={`/customers/${c.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{c.contactName || "-"}</td>
                <td className="px-3 py-2">{c.contactPhone || "-"}</td>
                <td className="px-3 py-2">
                  {c.referrer ? c.referrer.name : "-"}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {c.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  暂无客户数据。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
