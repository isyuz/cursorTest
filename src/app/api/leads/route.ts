import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: { ownerId: number; status?: string } = { ownerId: user.id };
  if (status) where.status = status;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: [{ nextFollowAt: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json(leads);
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
    source,
    status,
    nextFollowAt,
    remark
  } = body;

  if (!name) {
    return NextResponse.json({ message: "线索名称不能为空" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      contactName: contactName ?? null,
      contactPhone: contactPhone ?? null,
      contactEmail: contactEmail ?? null,
      source: source ?? null,
      status: status ?? "NEW",
      nextFollowAt: nextFollowAt ? new Date(nextFollowAt) : null,
      remark: remark ?? null,
      ownerId: user.id
    }
  });

  return NextResponse.json(lead);
}
