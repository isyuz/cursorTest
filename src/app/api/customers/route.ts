import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const customers = await prisma.customer.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { referrer: true }
  });

  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
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

  const customer = await prisma.customer.create({
    data: {
      name,
      contactName,
      contactPhone,
      contactEmail,
      industry,
      size,
      tags,
      ownerId: user.id,
      referrerId: referrerId ?? null
    }
  });

  return NextResponse.json(customer);
}

