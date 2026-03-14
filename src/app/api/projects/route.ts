import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");

  const where: { ownerId: number; stage?: string } = { ownerId: user.id };
  if (stage) where.stage = stage;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { expectedCloseAt: "asc" },
    include: { customer: true, referrer: true }
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    name,
    customerId,
    amount,
    stage,
    commissionType,
    commissionRate,
    commissionAmount,
    expectedCloseAt,
    referrerId
  } = body;

  if (!name || !customerId || amount == null) {
    return NextResponse.json(
      { message: "项目名称、客户与金额不能为空" },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.findFirst({
    where: { id: Number(customerId), ownerId: user.id }
  });
  if (!customer) {
    return NextResponse.json({ message: "未找到客户" }, { status: 404 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      customerId: Number(customerId),
      ownerId: user.id,
      amount: Number(amount),
      stage: stage ?? "LEAD",
      commissionType: commissionType ?? "NONE",
      commissionRate: commissionRate != null ? Number(commissionRate) : null,
      commissionAmount:
        commissionAmount != null ? Number(commissionAmount) : null,
      expectedCloseAt: expectedCloseAt ? new Date(expectedCloseAt) : null,
      referrerId: referrerId ? Number(referrerId) : null
    },
    include: { customer: true, referrer: true }
  });

  return NextResponse.json(project);
}
