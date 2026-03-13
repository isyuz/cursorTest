import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-4 text-center text-2xl font-semibold text-slate-900">
          简易 CRM 系统
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          使用 Next.js + TailwindCSS + Prisma 构建的单人开发示例。
        </p>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            前往登录
          </Link>
        </div>
      </div>
    </main>
  );
}

