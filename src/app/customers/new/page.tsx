import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CustomerForm from "@/components/CustomerForm";

export default async function NewCustomerPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const referrers = await prisma.referrer.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          新建客户
        </h1>
        <CustomerForm referrers={referrers} />
      </div>
    </main>
  );
}

