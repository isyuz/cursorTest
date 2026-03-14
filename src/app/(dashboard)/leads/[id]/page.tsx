import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import LeadForm from "@/components/LeadForm";
import AddActivityForm from "@/components/AddActivityForm";
import { ActivityList } from "@/components/ActivityList";
import { ConvertLeadButton } from "@/components/ConvertLeadButton";

const STATUS_LABEL: Record<string, string> = {
  NEW: "新建",
  CONTACTED: "已联系",
  INVALID: "无效",
  CONVERTED: "已转客户"
};

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  CALL: "电话",
  WECHAT: "微信",
  EMAIL: "邮件",
  MEETING: "面谈",
  OTHER: "其他"
};

export default async function LeadDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const lead = await prisma.lead.findFirst({
    where: { id, ownerId: user.id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } }
      }
    }
  });

  if (!lead) notFound();

  const activities = lead.activities.map((a) => ({
    id: a.id,
    type: a.type,
    typeLabel: ACTIVITY_TYPE_LABEL[a.type] ?? a.type,
    content: a.content,
    userName: a.user.name,
    createdAt: a.createdAt.toISOString()
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center justify-between">
        <Link
          href="/leads"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← 返回线索列表
        </Link>
        {lead.status !== "CONVERTED" && (
          <ConvertLeadButton leadId={lead.id} />
        )}
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">基本信息</h2>
        <LeadForm
          leadId={lead.id}
          initialData={{
            name: lead.name,
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            source: lead.source,
            status: lead.status,
            nextFollowAt: lead.nextFollowAt?.toISOString().slice(0, 16),
            remark: lead.remark
          }}
        />
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">跟进记录</h2>
        <div className="mb-4">
          <AddActivityForm leadId={lead.id} />
        </div>
        <ActivityList activities={activities} />
      </section>
    </div>
  );
}
