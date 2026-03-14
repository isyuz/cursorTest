import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "无效 ID" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id, ownerId: user.id },
    include: { customer: true, referrer: true }
  });

  if (!project) {
    return NextResponse.json({ message: "未找到项目" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "无效 ID" }, { status: 400 });
  }

  const existing = await prisma.project.findFirst({
    where: { id, ownerId: user.id }
  });
  if (!existing) {
    return NextResponse.json({ message: "未找到项目" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    name,
    amount,
    stage,
    commissionType,
    commissionRate,
    commissionAmount,
    expectedCloseAt,
    referrerId
  } = body;

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(name != null && { name }),
      ...(amount != null && { amount: Number(amount) }),
      ...(stage != null && { stage }),
      ...(commissionType != null && { commissionType }),
      ...(commissionRate != null && { commissionRate: Number(commissionRate) }),
      ...(commissionAmount != null && {
        commissionAmount: Number(commissionAmount)
      }),
      ...(expectedCloseAt != null && {
        expectedCloseAt: expectedCloseAt ? new Date(expectedCloseAt) : null
      }),
      ...(referrerId !== undefined && {
        referrerId: referrerId ? Number(referrerId) : null
      })
    },
    include: { customer: true, referrer: true }
  });

  return NextResponse.json(updated);
}
