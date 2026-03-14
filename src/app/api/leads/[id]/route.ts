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

  const lead = await prisma.lead.findFirst({
    where: { id, ownerId: user.id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } }
      }
    }
  });

  if (!lead) {
    return NextResponse.json({ message: "未找到线索" }, { status: 404 });
  }

  return NextResponse.json(lead);
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

  const body = await request.json().catch(() => ({}));
  const {
    name,
    contactName,
    contactPhone,
    contactEmail,
    source,
    status,
    nextFollowAt,
    remark
  } = body;

  if (!name) {
    return NextResponse.json({ message: "线索名称不能为空" }, { status: 400 });
  }

  const existing = await prisma.lead.findFirst({
    where: { id, ownerId: user.id }
  });
  if (!existing) {
    return NextResponse.json({ message: "未找到线索" }, { status: 404 });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      name,
      contactName: contactName ?? null,
      contactPhone: contactPhone ?? null,
      contactEmail: contactEmail ?? null,
      source: source ?? null,
      status: status ?? existing.status,
      nextFollowAt: nextFollowAt ? new Date(nextFollowAt) : null,
      remark: remark ?? null
    }
  });

  return NextResponse.json(updated);
}
