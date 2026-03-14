import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CustomerForm from "@/components/CustomerForm";
import AddActivityForm from "@/components/AddActivityForm";
import { ActivityList } from "@/components/ActivityList";

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  CALL: "电话",
  WECHAT: "微信",
  EMAIL: "邮件",
  MEETING: "面谈",
  OTHER: "其他"
};

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const customer = await prisma.customer.findFirst({
    where: { id, ownerId: user.id },
    include: {
      referrer: true,
      projects: {
        include: { referrer: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!customer) notFound();

  const referrers = await prisma.referrer.findMany({
    orderBy: { createdAt: "desc" }
  });

  const activities = await prisma.activity.findMany({
    where: { customerId: id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center justify-between">
        <Link
          href="/customers"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← 返回客户列表
        </Link>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">基本信息</h2>
        <CustomerForm
          referrers={referrers}
          customerId={customer.id}
          initialData={{
            name: customer.name,
            contactName: customer.contactName,
            contactPhone: customer.contactPhone,
            contactEmail: customer.contactEmail,
            industry: customer.industry,
            size: customer.size,
            tags: customer.tags,
            referrerId: customer.referrerId
          }}
        />
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">销售机会</h2>
        <div className="mb-4">
          <Link
            href={`/projects/new?customerId=${customer.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            + 新建项目
          </Link>
        </div>
        {customer.projects.length === 0 ? (
          <p className="text-sm text-slate-500">暂无项目</p>
        ) : (
          <ul className="space-y-2">
            {customer.projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <Link
                  href={`/projects/${p.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {p.name}
                </Link>
                <span className="text-sm text-slate-500">
                  ¥{p.amount.toLocaleString()} · {p.stage}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">跟进记录</h2>
        <div className="mb-4">
          <AddActivityForm customerId={customer.id} />
        </div>
        <ActivityList
          activities={activities.map((a) => ({
            id: a.id,
            type: a.type,
            typeLabel: ACTIVITY_TYPE_LABEL[a.type] ?? a.type,
            content: a.content,
            userName: a.user.name,
            createdAt: a.createdAt.toISOString()
          }))}
        />
      </section>
    </div>
  );
}
