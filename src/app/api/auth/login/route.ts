import { NextResponse } from "next/server";
import { signInWithEmailPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json(
      { message: "邮箱和密码不能为空" },
      { status: 400 }
    );
  }

  const user = await signInWithEmailPassword(email, password);

  if (!user) {
    return NextResponse.json({ message: "账号或密码错误" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
}

