import { getCurrentUser } from "@/lib/auth";
import LeadForm from "@/components/LeadForm";

export default async function NewLeadPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">新建线索</h1>
      <LeadForm />
    </div>
  );
}
