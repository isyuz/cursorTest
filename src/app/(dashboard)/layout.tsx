import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const nav = [
    { href: "/dashboard", label: "仪表盘" },
    { href: "/leads", label: "线索" },
    { href: "/customers", label: "客户" },
    { href: "/projects", label: "机会/项目" }
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <Link href="/dashboard" className="font-semibold text-slate-800">
            CRM 系统
          </Link>
        </div>
        <nav className="flex-1 p-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mb-0.5 flex rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <p className="truncate text-xs text-slate-500">{user.name}</p>
          <Link
              href="/logout"
              className="mt-1 block text-xs text-slate-500 hover:text-slate-700"
            >
              退出登录
            </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
