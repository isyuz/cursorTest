import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const leadId = searchParams.get("leadId");

  if (!customerId && !leadId) {
    return NextResponse.json(
      { message: "请提供 customerId 或 leadId" },
      { status: 400 }
    );
  }

  if (customerId) {
    const cid = Number(customerId);
    if (!Number.isFinite(cid)) {
      return NextResponse.json({ message: "无效 customerId" }, { status: 400 });
    }
    const customer = await prisma.customer.findFirst({
      where: { id: cid, ownerId: user.id }
    });
    if (!customer) {
      return NextResponse.json({ message: "未找到客户" }, { status: 404 });
    }
  }
  if (leadId) {
    const lid = Number(leadId);
    if (!Number.isFinite(lid)) {
      return NextResponse.json({ message: "无效 leadId" }, { status: 400 });
    }
    const lead = await prisma.lead.findFirst({
      where: { id: lid, ownerId: user.id }
    });
    if (!lead) {
      return NextResponse.json({ message: "未找到线索" }, { status: 404 });
    }
  }

  const where: { customerId?: number; leadId?: number } = {};
  if (customerId) where.customerId = Number(customerId);
  if (leadId) where.leadId = Number(leadId);

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  });

  return NextResponse.json(activities);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { type, content, customerId, leadId } = body;

  if (!content || !type) {
    return NextResponse.json(
      { message: "跟进方式与内容不能为空" },
      { status: 400 }
    );
  }

  if (!customerId && !leadId) {
    return NextResponse.json(
      { message: "请关联客户或线索" },
      { status: 400 }
    );
  }

  const cid = customerId ? Number(customerId) : null;
  const lid = leadId ? Number(leadId) : null;

  if (cid !== null && !Number.isFinite(cid)) {
    return NextResponse.json({ message: "无效 customerId" }, { status: 400 });
  }
  if (lid !== null && !Number.isFinite(lid)) {
    return NextResponse.json({ message: "无效 leadId" }, { status: 400 });
  }

  if (cid) {
    const customer = await prisma.customer.findFirst({
      where: { id: cid, ownerId: user.id }
    });
    if (!customer) {
      return NextResponse.json({ message: "未找到客户" }, { status: 404 });
    }
  }
  if (lid) {
    const lead = await prisma.lead.findFirst({
      where: { id: lid, ownerId: user.id }
    });
    if (!lead) {
      return NextResponse.json({ message: "未找到线索" }, { status: 404 });
    }
  }

  const activity = await prisma.activity.create({
    data: {
      type,
      content,
      customerId: cid,
      leadId: lid,
      userId: user.id
    },
    include: { user: { select: { name: true } } }
  });

  return NextResponse.json(activity);
}
