## 项目简介

这是一个基于 **Next.js 14**、**React 18**、**Prisma** 和 **Tailwind CSS** 的简单 CRM 应用，用于管理客户、项目及销售线索。

## 环境要求

- Node.js 18+（建议使用最新版 LTS）
- npm 或 pnpm / yarn（以下以 npm 为例）

## 本地开发部署

1. **安装依赖**

   ```bash
   npm install
   ```

2. **配置环境变量**

   在项目根目录创建 `.env` 文件，至少包含数据库配置，例如（默认使用 SQLite）：

   ```bash
   DATABASE_URL="file:./dev.db"
   ```

   如已存在 `.env` 文件，可按实际需求修改，无需重复创建。

3. **初始化数据库（Prisma）**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **启动开发服务器**

   ```bash
   npm run dev
   ```

   默认访问地址：`http://localhost:3000`

## 生产部署（基本流程）

1. 确保在服务器上安装好 Node.js 18+。
2. 将代码拉取到服务器（例如使用 git）。
3. 在服务器上安装依赖：

   ```bash
   npm install
   ```

4. 在服务器上配置 `.env`，将 `DATABASE_URL` 指向生产数据库（可以是 SQLite、PostgreSQL 等）。
5. 执行数据库迁移并生成客户端：

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. 构建并启动生产服务：

   ```bash
   npm run build
   npm start
   ```

7. 使用 Nginx 等反向代理将外部请求转发到该 Node 服务（可选，根据你的服务器环境配置）。

## 常用脚本

- `npm run dev`：启动开发环境
- `npm run build`：打包构建生产版本
- `npm start`：以生产模式启动服务（需先执行 `npm run build`）
- `npm run prisma:migrate`：开发时执行数据库迁移
- `npm run prisma:generate`：生成 Prisma 客户端

