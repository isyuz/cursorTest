import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProjectStageForm } from "@/components/ProjectStageForm";

const STAGE_LABEL: Record<string, string> = {
  LEAD: "线索",
  QUALIFIED: "确认需求",
  PROPOSAL: "方案报价",
  NEGOTIATION: "谈判",
  WON: "赢单",
  LOST: "输单"
};

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const project = await prisma.project.findFirst({
    where: { id, ownerId: user.id },
    include: { customer: true, referrer: true }
  });

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← 返回项目列表
        </Link>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          {project.name}
        </h1>
        <dl className="grid gap-2 text-sm">
          <div className="flex">
            <dt className="w-24 text-slate-500">客户</dt>
            <dd>
              <Link
                href={`/customers/${project.customerId}`}
                className="text-blue-600 hover:underline"
              >
                {project.customer.name}
              </Link>
            </dd>
          </div>
          <div className="flex">
            <dt className="w-24 text-slate-500">介绍人</dt>
            <dd>{project.referrer ? project.referrer.name : "-"}</dd>
          </div>
          <div className="flex">
            <dt className="w-24 text-slate-500">金额</dt>
            <dd>¥{project.amount.toLocaleString()}</dd>
          </div>
          <div className="flex">
            <dt className="w-24 text-slate-500">阶段</dt>
            <dd>
              <ProjectStageForm
                projectId={project.id}
                currentStage={project.stage}
                stageLabel={STAGE_LABEL[project.stage] ?? project.stage}
              />
            </dd>
          </div>
          <div className="flex">
            <dt className="w-24 text-slate-500">预计成交</dt>
            <dd>
              {project.expectedCloseAt
                ? project.expectedCloseAt.toISOString().slice(0, 10)
                : "-"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
