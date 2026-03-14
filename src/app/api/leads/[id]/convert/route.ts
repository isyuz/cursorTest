import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "无效 ID" }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: { id, ownerId: user.id }
  });
  if (!lead) {
    return NextResponse.json({ message: "未找到线索" }, { status: 404 });
  }

  if (lead.status === "CONVERTED") {
    return NextResponse.json({ message: "该线索已转为客户" }, { status: 400 });
  }

  const customer = await prisma.$transaction(async (tx) => {
    const c = await tx.customer.create({
      data: {
        name: lead.name,
        contactName: lead.contactName,
        contactPhone: lead.contactPhone,
        contactEmail: lead.contactEmail,
        ownerId: user.id
      }
    });

    await tx.lead.update({
      where: { id },
      data: { status: "CONVERTED" }
    });

    return c;
  });

  return NextResponse.json(customer);
}
