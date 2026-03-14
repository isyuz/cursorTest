import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CustomerForm from "@/components/CustomerForm";

export default async function NewCustomerPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const referrers = await prisma.referrer.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">新建客户</h1>
      <CustomerForm referrers={referrers} />
    </div>
  );
}
