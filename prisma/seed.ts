import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@admin.com";
  const password = "admin";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name: email, role: "ADMIN" },
    create: {
      email,
      password: hashedPassword,
      name: "admin",
      role: "ADMIN",
    },
  });

  console.log("用户已创建/更新：", { id: user.id, email: user.email, name: user.name, role: user.role });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
