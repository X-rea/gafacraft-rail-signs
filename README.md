# GAFAcraft 铁路站牌生成器

这是当前网站第 14 版的可移交源码，已调整为标准 Next.js 项目，可直接推送到 GitHub 并由 Vercel 部署。

## 本地运行

需要 Node.js 22。

```bash
npm ci
npm run dev
```

浏览器打开 `http://localhost:3000`。

## 本地检查

```bash
npm run lint
npm run build
```

## 上传到 GitHub

在解压后的项目根目录执行：

```bash
git init
git add .
git commit -m "Initial GAFAcraft rail signs site"
git branch -M main
git remote add origin <你的 GitHub 仓库地址>
git push -u origin main
```

## 用 Vercel 部署

1. 登录 Vercel，点击 **Add New → Project**。
2. 导入刚才的 GitHub 仓库。
3. Framework Preset 保持 **Next.js**。
4. Root Directory 保持项目根目录，不需要填写环境变量。
5. 点击 **Deploy**。

Vercel 会使用 `npm run build`，部署成功后会生成长期有效的 `vercel.app` 地址。

## 主要代码位置

- `app/page.tsx`：站牌生成器的功能、数据与 SVG 绘制逻辑。
- `app/globals.css`：网站界面和响应式样式。
- `app/layout.tsx`：页面标题、描述与图标。
- `components/ui/`：界面控件。
- `public/`：网站静态资源。

## 版本说明

- 导出基线：网站第 14 版（广州东站默认参考，2号线）
- 交付用途：GitHub 源码托管、Vercel 部署、本地继续开发
- 当前版本不依赖数据库、账号系统或付费 API
