import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NewProjectForm } from "@/components/NewProjectForm";

export default async function NewProjectPage({
  searchParams
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { customerId: customerIdQuery } = await searchParams;
  const customerId = customerIdQuery ? Number(customerIdQuery) : undefined;

  const [customers, referrers] = await Promise.all([
    prisma.customer.findMany({
      where: { ownerId: user.id },
      orderBy: { name: "asc" }
    }),
    prisma.referrer.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4">
        <Link
          href="/projects"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← 返回项目列表
        </Link>
      </header>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">新建项目</h1>
      <NewProjectForm
        customers={customers}
        referrers={referrers}
        defaultCustomerId={customerId}
      />
    </div>
  );
}
