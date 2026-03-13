import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Params = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "无效 ID" }, { status: 400 });
  }

  const customer = await prisma.customer.findFirst({
    where: { id, ownerId: user.id },
    include: {
      referrer: true,
      projects: {
        include: { referrer: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!customer) {
    return NextResponse.json({ message: "未找到客户" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "无效 ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    name,
    contactName,
    contactPhone,
    contactEmail,
    industry,
    size,
    tags,
    referrerId
  } = body;

  if (!name) {
    return NextResponse.json({ message: "客户名称不能为空" }, { status: 400 });
  }

  const existing = await prisma.customer.findFirst({
    where: { id, ownerId: user.id }
  });
  if (!existing) {
    return NextResponse.json({ message: "未找到客户" }, { status: 404 });
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      name,
      contactName,
      contactPhone,
      contactEmail,
      industry,
      size,
      tags,
      referrerId: referrerId ?? null
    }
  });

  return NextResponse.json(updated);
}

